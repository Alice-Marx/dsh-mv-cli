"""Development-only transpiler: the restricted Python subset of world.execute-me-ascii's
scenes.py -> an ES module that runs on the JS Canvas in .dsh-plugin/client/mv/canvas.mjs.

Python semantics that differ from JS are routed through small runtime helpers
(.dsh-plugin/client/mv/pyrt.mjs): floor division and modulo, negative indices,
slices, list/str concatenation and repetition, tuple comparison, dict/set with
tuple keys, banker's rounding, code-point string indexing and format specs.
Not shipped in the npm package; the generated module is.
"""
import ast, json, sys

JS_RESERVED = {'new','delete','var','function','default','this','class','case','switch','with','yield','let',
    'const','void','arguments','eval','package','interface','private','public','static','enum','export',
    'extends','super','typeof','instanceof','catch','finally','throw','try','do','debugger','implements',
    'protected','await','null','true','false','undefined','NaN','Infinity','Math','Object','Array','String','Number'}
OVERRIDE = {'hash16'}  # hand-written in pyrt (32-bit multiply exceeds double precision)
NUMERIC_CALLS = {'int','len','abs','round','hash16','clamp','mix','min','max','sum','ord','glitch_intensity','float'}
BUILTINS = {
    'range':'$range','enumerate':'$enumerate','zip':'$zip','sorted':'$sorted','sum':'$sum','min':'$min','max':'$max',
    'len':'$len','int':'$int','float':'$float','abs':'Math.abs','round':'$round','str':'$str','next':'$next','chr':'$chr',
    'ord':'$ord','bin':'$bin','list':'$list','tuple':'$list','isinstance':'$isinstance','set':'$set_','dict':'$dict_',
    'any':'$any','all':'$all','reversed':'$reversed',
}
STR_METHODS = {'upper':'toUpperCase','lower':'toLowerCase'}

def name(n):
    return n + '_' if n in JS_RESERVED else n

class Fn:
    def __init__(self, params): self.params=set(params); self.locals=[]
    def add(self, n):
        if n not in self.params and n not in self.locals: self.locals.append(n)

def targets_names(t, out):
    if isinstance(t, ast.Name): out.append(t.id)
    elif isinstance(t, (ast.Tuple, ast.List)):
        for e in t.elts: targets_names(e, out)
    elif isinstance(t, ast.Starred): targets_names(t.value, out)

def collect_locals(body, fn):
    """Assigned names in this function body, not descending into nested defs/comprehensions."""
    stack=list(body)
    while stack:
        n=stack.pop()
        if isinstance(n, ast.FunctionDef):
            fn.add(n.name); continue
        if isinstance(n, (ast.Lambda, ast.ListComp, ast.SetComp, ast.GeneratorExp, ast.DictComp)): continue
        names=[]
        if isinstance(n, ast.Assign):
            for t in n.targets: targets_names(t, names)
        elif isinstance(n, (ast.AugAssign, ast.AnnAssign)): targets_names(n.target, names)
        elif isinstance(n, ast.For): targets_names(n.target, names)
        for x in names: fn.add(x)
        stack.extend(ast.iter_child_nodes(n))

class T:
    def __init__(self): self.out=[]; self.tmp=0; self.fn=None; self.module_names=[]

    def t(self):
        self.tmp+=1; return f'$t{self.tmp}'

    # ---------------- expressions
    def numeric(self, n):
        if isinstance(n, ast.Constant): return isinstance(n.value,(int,float)) and not isinstance(n.value,bool)
        if isinstance(n, ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)): return self.numeric(n.operand)
        if isinstance(n, ast.BinOp):
            if isinstance(n.op,(ast.Sub,ast.Div,ast.FloorDiv,ast.Pow,ast.BitAnd,ast.BitXor,ast.RShift,ast.LShift,ast.BitOr)): return True
            if isinstance(n.op, ast.Mod): return self.numeric(n.left)
            return self.numeric(n.left) and self.numeric(n.right)
        if isinstance(n, ast.Call):
            f=n.func
            if isinstance(f, ast.Name) and f.id in NUMERIC_CALLS: return True
            if isinstance(f, ast.Attribute) and isinstance(f.value, ast.Name) and f.value.id=='math': return True
        if isinstance(n, ast.Attribute) and isinstance(n.value, ast.Name) and n.value.id=='math': return True
        if isinstance(n, ast.Attribute) and n.attr in ('w','h'): return True
        return False

    def stringy(self, n):
        return (isinstance(n, ast.Constant) and isinstance(n.value,str)) or isinstance(n, ast.JoinedStr)

    def truth(self, n):
        e=self.expr(n)
        if isinstance(n,(ast.Compare,)) or (isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.Not)) or isinstance(n, ast.BoolOp) and all(isinstance(v,ast.Compare) for v in n.values):
            return e
        if isinstance(n, ast.Constant): return e
        return f'$truth({e})'

    def expr(self, n):
        m=getattr(self,'e_'+type(n).__name__,None)
        if m is None: raise NotImplementedError(f'{type(n).__name__} at line {getattr(n,"lineno","?")}: {ast.unparse(n)[:80]}')
        return m(n)

    def e_Constant(self, n):
        v=n.value
        if v is None: return 'null'
        if v is True: return 'true'
        if v is False: return 'false'
        if isinstance(v, str): return json.dumps(v, ensure_ascii=False)
        if isinstance(v, float):
            r=repr(v)
            return r if r not in ('inf','-inf') else ('Infinity' if v>0 else '-Infinity')
        return str(v)

    def e_Name(self, n):
        return name(n.id)

    def e_Tuple(self, n): return '[' + ', '.join(self.elt(e) for e in n.elts) + ']'
    e_List=e_Tuple
    def elt(self, e):
        if isinstance(e, ast.Starred): return '...$iter(' + self.expr(e.value) + ')'
        return self.expr(e)

    def e_Set(self, n): return 'new PySet([' + ', '.join(self.expr(e) for e in n.elts) + '])'
    def e_Dict(self, n):
        return 'new PyDict([' + ', '.join(f'[{self.expr(k)}, {self.expr(v)}]' for k,v in zip(n.keys,n.values)) + '])'

    def e_UnaryOp(self, n):
        o=self.expr(n.operand)
        if isinstance(n.op, ast.USub): return f'(-{o})'
        if isinstance(n.op, ast.UAdd): return f'(+{o})'
        if isinstance(n.op, ast.Not): return f'(!{self.truth(n.operand)})'
        if isinstance(n.op, ast.Invert): return f'(~{o})'
        raise NotImplementedError(n.op)

    def e_BinOp(self, n):
        l=self.expr(n.left); r=self.expr(n.right); op=n.op
        bothnum=self.numeric(n.left) and self.numeric(n.right)
        if isinstance(op, ast.Add):
            if bothnum or self.stringy(n.left) or self.stringy(n.right): return f'({l} + {r})'
            return f'$add({l}, {r})'
        if isinstance(op, ast.Mult):
            if bothnum: return f'({l} * {r})'
            return f'$mul({l}, {r})'
        if isinstance(op, ast.Sub): return f'({l} - {r})'
        if isinstance(op, ast.Div): return f'({l} / {r})'
        if isinstance(op, ast.FloorDiv): return f'Math.floor({l} / {r})'
        if isinstance(op, ast.Mod): return f'$mod({l}, {r})'
        if isinstance(op, ast.Pow): return f'(({l}) ** ({r}))'
        if isinstance(op, ast.BitAnd): return f'$band({l}, {r})'
        if isinstance(op, ast.BitOr): return f'$bor({l}, {r})'
        if isinstance(op, ast.BitXor): return f'$bxor({l}, {r})'
        if isinstance(op, ast.RShift): return f'$rshift({l}, {r})'
        if isinstance(op, ast.LShift): return f'$lshift({l}, {r})'
        raise NotImplementedError(op)

    def e_BoolOp(self, n):
        j=' && ' if isinstance(n.op, ast.And) else ' || '
        return '(' + j.join(self.expr(v) for v in n.values) + ')'

    def cmp1(self, op, a, b, an, bn):
        prim=lambda x: (isinstance(x, ast.Constant) and not isinstance(x.value,(tuple,))) or self.numeric(x)
        if isinstance(op, ast.Eq): return f'({a} === {b})' if (prim(an) or prim(bn)) else f'$eq({a}, {b})'
        if isinstance(op, ast.NotEq): return f'({a} !== {b})' if (prim(an) or prim(bn)) else f'(!$eq({a}, {b}))'
        if isinstance(op, ast.Is): return f'({a} == {b})' if (isinstance(bn,ast.Constant) and bn.value is None) else f'({a} === {b})'
        if isinstance(op, ast.IsNot): return f'({a} != {b})' if (isinstance(bn,ast.Constant) and bn.value is None) else f'({a} !== {b})'
        if isinstance(op, ast.In): return f'$in({a}, {b})'
        if isinstance(op, ast.NotIn): return f'(!$in({a}, {b}))'
        sym={ast.Lt:'<',ast.LtE:'<=',ast.Gt:'>',ast.GtE:'>='}[type(op)]
        if isinstance(an,(ast.Tuple,ast.List)) or isinstance(bn,(ast.Tuple,ast.List)): return f'($cmp({a}, {b}) {sym} 0)'
        return f'({a} {sym} {b})'

    def e_Compare(self, n):
        parts=[]; left=n.left; lj=self.expr(left)
        for op, right in zip(n.ops, n.comparators):
            rj=self.expr(right)
            parts.append(self.cmp1(op, lj, rj, left, right))
            left, lj = right, rj
        return parts[0] if len(parts)==1 else '(' + ' && '.join(parts) + ')'

    def e_IfExp(self, n):
        return f'({self.truth(n.test)} ? {self.expr(n.body)} : {self.expr(n.orelse)})'

    def e_Attribute(self, n):
        if isinstance(n.value, ast.Name) and n.value.id=='math':
            if n.attr=='tau': return '(2 * Math.PI)'
            if n.attr=='pi': return 'Math.PI'
            if n.attr=='inf': return 'Infinity'
            return 'Math.' + n.attr
        return f'{self.expr(n.value)}.{n.attr}'

    def e_Subscript(self, n):
        v=self.expr(n.value); s=n.slice
        if isinstance(s, ast.Slice):
            lo=self.expr(s.lower) if s.lower else 'null'
            hi=self.expr(s.upper) if s.upper else 'null'
            st=self.expr(s.step) if s.step else 'null'
            return f'$slice({v}, {lo}, {hi}, {st})'
        return f'$at({v}, {self.expr(s)})'

    def e_JoinedStr(self, n):
        parts=[]
        for v in n.values:
            if isinstance(v, ast.Constant): parts.append(json.dumps(v.value, ensure_ascii=False))
            else:
                spec=''
                if v.format_spec is not None:
                    if not all(isinstance(x, ast.Constant) for x in v.format_spec.values): raise NotImplementedError('dynamic spec')
                    spec=''.join(x.value for x in v.format_spec.values)
                parts.append(f'$fmt({self.expr(v.value)}, {json.dumps(spec)})')
        return '(' + ' + '.join(parts or ['""']) + ')'

    def comp(self, n, kind):
        gens=n.generators
        body_expr = (self.expr(n.elt) if kind!='dict' else f'[{self.expr(n.key)}, {self.expr(n.value)}]')
        code='$r.push(' + body_expr + ');'
        for g in reversed(gens):
            conds=''.join(f'if (!{self.truth(c)}) continue; ' for c in g.ifs)
            code=f'for (const {self.pattern(g.target)} of $iter({self.expr(g.iter)})) {{ {conds}{code} }}'
        wrap={'list':'$r','set':'new PySet($r)','dict':'new PyDict($r)'}[kind]
        return f'(() => {{ const $r = []; {code} return {wrap}; }})()'
    def e_ListComp(self, n): return self.comp(n,'list')
    def e_GeneratorExp(self, n): return self.comp(n,'list')
    def e_SetComp(self, n): return self.comp(n,'set')
    def e_DictComp(self, n): return self.comp(n,'dict')

    def pattern(self, t):
        if isinstance(t, ast.Name): return name(t.id)
        if isinstance(t, (ast.Tuple, ast.List)): return '[' + ', '.join(self.pattern(e) for e in t.elts) + ']'
        raise NotImplementedError('pattern ' + ast.unparse(t))

    def e_Call(self, n):
        if n.keywords: raise NotImplementedError('keywords at %d' % n.lineno)
        args=', '.join(self.elt(a) for a in n.args)
        f=n.func
        if isinstance(f, ast.Name):
            if f.id=='isinstance':
                tn=n.args[1]
                names=[e.id for e in (tn.elts if isinstance(tn, ast.Tuple) else [tn])]
                return f'$isinstance({self.expr(n.args[0])}, {json.dumps(names)})'
            if f.id in BUILTINS: return f'{BUILTINS[f.id]}({args})'
            return f'{name(f.id)}({args})'
        if isinstance(f, ast.Attribute):
            obj=self.expr(f.value); a=f.attr
            if isinstance(f.value, ast.Name) and f.value.id=='math':
                return f'{self.e_Attribute(f)}({args})'
            if isinstance(f.value, ast.Attribute) and f.value.attr=='__class__':
                return f'new ({self.expr(f.value.value)}.constructor)({args})'
            if a=='__class__': return f'new ({obj}.constructor)({args})'
            if a=='join': return f'$join({obj}, {args})'
            if a=='append': return f'{obj}.push({args})'
            if a=='items': return f'$items({obj})'
            if a=='get': return f'$get({obj}, {args})'
            if a=='strip': return f'$strip({obj}{", " + args if args else ""})'
            if a in STR_METHODS: return f'{obj}.{STR_METHODS[a]}()'
            if a=='ljust': return f'$ljust({obj}, {args})'
            if a=='rjust': return f'$rjust({obj}, {args})'
            if a=='count': return f'$count({obj}, {args})'
            if a=='split': return f'$split({obj}{", " + args if args else ""})'
            if a=='replace': return f'{obj}.split({self.expr(n.args[0])}).join({self.expr(n.args[1])})'
            if a=='startswith': return f'{obj}.startsWith({args})'
            if a=='endswith': return f'{obj}.endsWith({args})'
            if a=='index': return f'$index({obj}, {args})'
            return f'{obj}.{a}({args})'
        return f'({self.expr(f)})({args})'

    # ---------------- statements
    def emit(self, line, ind): self.out.append('  '*ind + line)

    def assign_to(self, target, value_js, ind):
        if isinstance(target, ast.Name): self.emit(f'{name(target.id)} = {value_js};', ind)
        elif isinstance(target, (ast.Tuple, ast.List)): self.emit(f'{self.pattern(target)} = $unpack({value_js}, {len(target.elts)});', ind)
        elif isinstance(target, ast.Subscript):
            if isinstance(target.slice, ast.Slice):
                sl=target.slice
                if sl.step: raise NotImplementedError('extended slice assign')
                lo=self.expr(sl.lower) if sl.lower else 'null'; hi=self.expr(sl.upper) if sl.upper else 'null'
                self.emit(f'$setslice({self.expr(target.value)}, {lo}, {hi}, {value_js});', ind); return
            self.emit(f'$setitem({self.expr(target.value)}, {self.expr(target.slice)}, {value_js});', ind)
        elif isinstance(target, ast.Attribute): self.emit(f'{self.expr(target)} = {value_js};', ind)
        else: raise NotImplementedError(ast.unparse(target))

    def block(self, body, ind):
        for s in body: self.stmt(s, ind)

    def stmt(self, s, ind):
        k=type(s).__name__
        if k=='Expr':
            if isinstance(s.value, ast.Constant) and isinstance(s.value.value, str): return  # docstring
            self.emit(self.expr(s.value) + ';', ind); return
        if k=='Assign':
            v=self.expr(s.value)
            if len(s.targets)>1:
                tmp=self.t(); self.emit(f'const {tmp} = {v};', ind)
                for t in s.targets: self.assign_to(t, tmp, ind)
            else: self.assign_to(s.targets[0], v, ind)
            return
        if k=='AugAssign':
            fake=ast.BinOp(left=ast.Name(id='$X') , op=s.op, right=s.value)
            t=s.target
            if isinstance(t, ast.Name):
                cur=name(t.id); fake.left=ast.Name(id=t.id)
                self.emit(f'{cur} = {self.e_BinOp(fake)};', ind)
            elif isinstance(t, ast.Subscript):
                o=self.t(); i=self.t()
                self.emit(f'const {o} = {self.expr(t.value)}, {i} = {self.expr(t.slice)};', ind)
                fake.left=ast.Subscript(value=ast.Name(id=o), slice=ast.Name(id=i))
                self.emit(f'$setitem({o}, {i}, {self.e_BinOp(fake)});', ind)
            elif isinstance(t, ast.Attribute):
                fake.left=t; self.emit(f'{self.expr(t)} = {self.e_BinOp(fake)};', ind)
            return
        if k=='If':
            self.emit(f'if ({self.truth(s.test)}) {{', ind); self.block(s.body, ind+1)
            orelse=s.orelse
            while len(orelse)==1 and isinstance(orelse[0], ast.If):
                e=orelse[0]; self.emit(f'}} else if ({self.truth(e.test)}) {{', ind); self.block(e.body, ind+1); orelse=e.orelse
            if orelse: self.emit('} else {', ind); self.block(orelse, ind+1)
            self.emit('}', ind); return
        if k=='For':
            if s.orelse: raise NotImplementedError('for-else')
            it=s.iter
            if isinstance(it, ast.Call) and isinstance(it.func, ast.Name) and it.func.id=='range' and not it.keywords and all(not isinstance(a, ast.Starred) for a in it.args):
                a=[self.expr(x) for x in it.args]
                start,stop,step=('0',a[0],'1') if len(a)==1 else (a[0],a[1],'1') if len(a)==2 else a
                k_,e_,st_=self.t(),self.t(),self.t()
                self.emit(f'for (let {k_} = $int({start}), {e_} = $int({stop}), {st_} = {step}; {st_} > 0 ? {k_} < {e_} : {k_} > {e_}; {k_} += {st_}) {{', ind)
                self.assign_to(s.target, k_, ind+1)
            else:
                v=self.t()
                self.emit(f'for (const {v} of $iter({self.expr(it)})) {{', ind)
                self.assign_to(s.target, v, ind+1)
            self.block(s.body, ind+1); self.emit('}', ind); return
        if k=='While':
            self.emit(f'while ({self.truth(s.test)}) {{', ind); self.block(s.body, ind+1); self.emit('}', ind); return
        if k=='Return':
            self.emit('return' + ((' ' + self.expr(s.value)) if s.value is not None else '') + ';', ind); return
        if k=='Pass': self.emit(';', ind); return
        if k=='Break': self.emit('break;', ind); return
        if k=='Continue': self.emit('continue;', ind); return
        if k=='FunctionDef': self.funcdef(s, ind); return
        if k=='Import':
            for a in s.names:
                if a.name!='math': raise NotImplementedError('import ' + a.name)
            return
        raise NotImplementedError(f'{k} at line {s.lineno}')

    def funcdef(self, s, ind, top=False):
        if s.decorator_list: raise NotImplementedError('decorator')
        a=s.args
        if a.vararg or a.kwarg or a.kwonlyargs: raise NotImplementedError('varargs')
        params=[x.arg for x in a.args]
        defaults=[None]*(len(params)-len(a.defaults)) + list(a.defaults)
        ps=[]
        for p,d in zip(params, defaults):
            ps.append(name(p) + ('' if d is None else ' = ' + self.expr(d)))
        prev=self.fn; self.fn=Fn(params)
        collect_locals(s.body, self.fn)
        nested={x.name for x in s.body if isinstance(x, ast.FunctionDef)}
        self.emit(('export ' if top else '') + f'function {name(s.name)}({", ".join(ps)}) {{', ind)
        lets=[name(x) for x in self.fn.locals if x not in nested]
        if lets: self.emit('let ' + ', '.join(lets) + ';', ind+1)
        self.block(s.body, ind+1)
        self.emit('}', ind)
        self.fn=prev

    def module(self, tree):
        mod=Fn([]); collect_locals(tree.body, mod)
        funcs={x.name for x in tree.body if isinstance(x, ast.FunctionDef)}
        lets=[name(x) for x in mod.locals if x not in funcs]
        self.emit("import { PyDict, PySet, $add, $mul, $mod, $band, $bor, $bxor, $rshift, $lshift, $eq, $cmp, $in, $at, $setitem, $setslice, $slice, $iter, $unpack, $truth, $fmt, $range, $enumerate, $zip, $sorted, $sum, $min, $max, $len, $int, $float, $round, $str, $next, $chr, $ord, $bin, $list, $isinstance, $set_, $dict_, $any, $all, $reversed, $join, $items, $get, $strip, $ljust, $rjust, $count, $split, $index, hash16 } from './pyrt.mjs'", 0)
        if lets: self.emit('export let ' + ', '.join(lets) + ';', 0)
        for s in tree.body:
            if isinstance(s, ast.FunctionDef):
                if s.name in OVERRIDE: continue
                self.funcdef(s, 0, top=True)
            else: self.stmt(s, 0)
        return '\n'.join(self.out) + '\n'

if __name__=='__main__':
    src, dst = sys.argv[1], sys.argv[2]
    tree=ast.parse(open(src, encoding='utf-8').read())
    header=('// GENERATED by tools/py2js.py from world.execute-me-ascii scenes.py — do not edit by hand.\n'
            '// Scene code (c) yym8224961 (github.com/yym8224961/world.execute-me-ascii), used and modified\n'
            '// with the author\'s permission granted to Alice-Marx on 2026-10-03. See NOTICE.md.\n')
    js=T().module(tree)
    open(dst,'w',encoding='utf-8').write(header + js)
    print('ok', dst, len(js))
