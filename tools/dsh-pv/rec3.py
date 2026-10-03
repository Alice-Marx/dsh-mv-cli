import json, sys, collections, os, math
sys.argv=['dsh_her.py']; sys.path.insert(0,'.')
import dsh_her
from PIL import ImageDraw, Image
REC=[]; HER=[]
def flat(xy):
    out=[]
    for v in (xy if isinstance(xy,(list,tuple)) else [xy]):
        if isinstance(v,(list,tuple)): out+=[float(a) for a in v]
        else: out.append(float(v))
    return out
def col(c):
    if c is None: return None
    if isinstance(c,int): return [c,c,c,255]
    if isinstance(c,(tuple,list)): c=list(c); return c+[255]*(4-len(c)) if len(c)<4 else c[:4]
    return str(c)
def wrap(name):
    f=getattr(ImageDraw.ImageDraw,name)
    def g(self,*a,**k):
        try:
            if self.im.size==(1280,720):
                xy=a[0] if a else k.get('xy')
                e={'k':name,'xy':flat(xy)}
                if name=='text':
                    e['s']=str(a[1] if len(a)>1 else k.get('text'))
                    fnt=k.get('font') or (a[3] if len(a)>3 else None)
                    e['size']=getattr(fnt,'size',None); e['font']=os.path.basename(getattr(fnt,'path','') or '')
                    e['fill']=col(k.get('fill', a[2] if len(a)>2 else None)); e['anchor']=k.get('anchor')
                else:
                    e['fill']=col(k.get('fill', a[1] if len(a)>1 else None)); e['outline']=col(k.get('outline')); e['width']=k.get('width', a[2] if name=='line' and len(a)>2 else 1)
                REC.append(e)
        except Exception as ex: print('ERR',name,ex)
        return f(self,*a,**k)
    setattr(ImageDraw.ImageDraw,name,g)
for n in ['text','rectangle','line','ellipse','polygon','point','arc','rounded_rectangle']: wrap(n)
v2,_=dsh_her.install()
import kit, tuikit
# blank the lyric banner (runtime draws the user's own words there)
ob=tuikit.banner_bits
def bb(text,rows,asp):
    im=ob(text,rows,asp)
    if text.strip().upper()!='IF I CAN': return im
    # redact: each word becomes a solid bar (the runtime writes the user's own words over it)
    from PIL import ImageDraw as D
    px=im.load(); w,h=im.size
    cols=[any(px[x,y] for y in range(h)) for x in range(w)]
    rows=[y for y in range(h) if any(px[x,y] for x in range(w))]
    out=im.point(lambda v:0); dd=D.Draw(out)
    x=0; runs=[]
    while x<w:
        if cols[x]:
            x0=x
            while x<w and (cols[x] or any(cols[x:x+max(3,w//40)])): x+=1
            runs.append((x0,x-1))
        x+=1
    on=255 if im.mode!='1' else 1
    for a,b in runs: dd.rectangle([a,min(rows),b,max(rows)],fill=on)
    return out
for m in list(sys.modules.values()):
    try:
        if getattr(m,'banner_bits',None) is ob: m.banner_bits=bb
    except Exception: pass
ohl=kit.her_layer
def hl(t,call,box_level=1.0):
    try: HER.append({'k':'layer','expr':call.get('expr'),'rect':list(call.get('rect',kit.LEFT)),'inside':dsh_her.inside(t),'kw':{k:v for k,v in call.get('kw',{}).items() if isinstance(v,(int,float,str))}})
    except Exception as ex: print('HERR',ex)
    return ohl(t,call,box_level)
kit.her_layer=hl
def wrap_pane(p):
    if getattr(p,'_rec',False): return p
    def pane(c,expr,*a,**kw):
        rect=a[0] if a else kw.get('rect',kit.LEFT)
        HER.append({'k':'pane','expr':expr,'rect':[round(v) for v in rect],'inside':dsh_her.inside(c.t),'mode':a[1] if len(a)>1 else kw.get('mode','half'),
                    'morph':kw.get('morph',1.0),'bright':kw.get('bright',1.0),'tint':kw.get('tint','blue'),'crop':kw.get('crop','full'),'glitch':kw.get('glitch',0)})
        return p(c,expr,*a,**kw)
    pane._rec=True; pane._dsh=True; return pane
for g in [kit.v1.approved.section.__dict__, sys.modules["engine"].__dict__]+[sh.fn.__globals__ for sh in v2.ALL]:
    if 'me_pane' in g: g['me_pane']=wrap_pane(g['me_pane'])
shots=json.load(open('/workspace/v060/shots.json'))
out=[]
sel=os.environ.get('SEL')
for sh in shots:
    if sel and str(sh['i']) not in sel.split(','): continue
    dur=sh['end']-sh['start']; nk=max(2,min(6,math.ceil(dur/0.5)))
    kfs=[]
    for j in range(nk):
        n=round((sh['start']+dur*(j+0.5)/nk)*24)
        n=max(round(sh['start']*24), min(n, round(sh['end']*24)-1))
        dsh_her.CUR[0]=(n-1)/24; v2.frame(n-1)
        REC.clear(); HER.clear(); t=n/24; dsh_her.CUR[0]=t; dsh_her.finish(v2.frame(n), t)
        kfs.append({'t':t,'ops':list(REC),'her':list(HER),'inside':dsh_her.inside(t),'levels':list(dsh_her.levels(t)),'gone':dsh_her.GONE<=t<dsh_her.BACK})
    out.append({'i':sh['i'],'fn':sh['fn'],'kf':kfs}); print(sh['i'],nk,flush=True)
json.dump({'cover':dsh_her.COVER,'lead':dsh_her.LEAD,'shots':out},open(os.environ.get('OUT','/workspace/v060/rec/rec3.json'),'w'),ensure_ascii=False)
