import json, re, sys, html
from html.parser import HTMLParser
BLOCKS=[('Sixlwa_userRow','u'),('hWmORq_root','h'),('TS9iAW_root','a'),('_root_luwio','tool'),('o3BgMG_root','tool'),('lcKema_root','tool'),
        ('cvtE3a_card','tool'),('gNWCoW_card','tool'),('Sixlwa_turnErrorRow','err'),('Sixlwa_retryRow','retry'),('Sixlwa_compactionRow','cmp'),
        ('Nqubda_panel','panel'),('Sixlwa_attachmentRow','att'),('pv-head','head'),('uV2eYG_root','comp'),('bOPqQW_root','foot'),('JObwrW_root','bar')]
SUB=['title','summary','label','timeEnd','name','purpose','readout','statusLabel','status','message','placeholder','input','bubble','body','errorSummary','summarySuffix','state','Title','Message','Code','Text','rowName','rowStatus']
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.stack=[]; s.blocks=[]; s.cur=None; s.skip=0
    def handle_starttag(s,tag,attrs):
        a=dict(attrs); cl=a.get('class',''); st=a.get('style','') or ''
        if tag in('svg','style','script'): s.skip+=1
        op=None
        m=re.search(r'opacity:\s*([\d.]+)',st)
        if m: op=float(m.group(1))
        kind=None
        for pre,k in BLOCKS:
            if pre in cl: kind=k; break
        if tag=='img' and s.cur is not None and s.cur['k']=='head': s.cur['img']=a.get('src')
        if kind and (s.cur is None or s.cur['k'] in('u',) and kind=='u' and False):
            pass
        ent={'tag':tag,'block':None,'op':op,'sub':None,'style':st,'cl':cl}
        if kind and s.cur is None:
            b={'k':kind,'parts':[],'op':1.0}
            # opacity from ancestors
            for e in s.stack:
                if e['op'] is not None: b['op']*=e['op']
            if op is not None: b['op']*=op
            s.blocks.append(b); s.cur=b; ent['block']=b
            if 'stopped' in cl: b['stopped']=1
        elif s.cur is None and tag=='div' and 'color:' in st and not cl:
            b={'k':'n','parts':[],'op':(op if op is not None else 1.0)}
            s.blocks.append(b); s.cur=b; ent['block']=b
        for x in SUB:
            if re.search(r'_'+x+r'\b',cl) or ('pv-'+x) in cl: ent['sub']=x
        if s.cur is not None:
            if 'Error' in cl or 'error' in cl: s.cur['error']=1
            if s.cur['k']=='head':
                m=re.search(r'background:\s*(#[0-9a-fA-F]+)',st)
                if m: s.cur['dot']=m.group(1)
        if tag=='br' and s.cur is not None: s._text('\n'); return
        if tag in('br','img','input','meta','hr'): return
        s.stack.append(ent)
    def handle_endtag(s,tag):
        if tag in('svg','style','script'): s.skip=max(0,s.skip-1)
        if tag in('br','img','input','meta','hr'): return
        while s.stack:
            e=s.stack.pop()
            if e['block'] is not None: s.cur=None
            if e['tag']==tag: break
    def _text(s,t):
        if s.cur is None: return
        sub=next((e['sub'] for e in reversed(s.stack) if e['sub']),'')
        if s.cur['parts'] and s.cur['parts'][-1][0]==sub: s.cur['parts'][-1][1]+=t
        else: s.cur['parts'].append([sub,t])
    def handle_data(s,d):
        if s.skip: return
        if not d.strip() and '\n' in d: return
        s._text(d)
def parse(body):
    p=P(); p.feed(body)
    out=[]
    for b in p.blocks:
        parts=[[k,re.sub(r'[ \t]+',' ',v).strip(' ')] for k,v in b['parts'] if v.strip()]
        e={'k':b['k'],'p':parts}
        if b['op']<0.999: e['o']=round(b['op'],2)
        for x in('error','stopped','dot','img'):
            if x in b: e[x]=b[x]
        out.append(e)
    return out
if __name__=='__main__':
    d=json.load(open(sys.argv[1]))
    it=d[int(sys.argv[2])]
    print(it['t']); 
    for b in parse(it['body']): print(json.dumps(b,ensure_ascii=False))
