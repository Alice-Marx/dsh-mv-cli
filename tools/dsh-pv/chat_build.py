import json, re, sys
sys.path.insert(0,'/workspace/v060/rec')
from chat import parse
SRC='/workspace/v060/pv/film/pv_dsh_frontend_20260927/'
frames=[]
for f in ['a1','a2','a3','b','c','seg','e','f','g']:
    for it in json.load(open(SRC+f+'_frames.json')):
        code = it['sheets']==['s-code']
        bl = [] if code else parse(it['body'])
        frames.append((it['n'], it['t'], code, bl))
frames.sort(key=lambda x:x[0])
def avatar(p):
    if not p: return None
    p=p.replace('avatars/','')
    return re.sub(r'\d{5}','N',p).replace('.png','')
def key(b): return b['k']
# text of a block as a single string for prefix tracking
def btext(b): return '\x1f'.join(k+'\x1e'+v for k,v in b['p'])
TABLE=[]; TIDX={}
def tid(b):
    j=json.dumps(b,ensure_ascii=False,sort_keys=True)
    if j not in TIDX: TIDX[j]=len(TABLE); TABLE.append(b)
    return TIDX[j]
# backward pass for typing identity: block i in frame f is "typing" toward block i in frame f+1 if same kind and text prefix
out=[]
nxt=None
for n,t,code,bl in reversed(frames):
    row=[]
    for i,b in enumerate(bl):
        b=dict(b)
        if b['k']=='head': b['img']=avatar(b.get('img'))
        o=b.pop('o',1.0)
        full=b; cnt=-1
        if nxt and i < len(nxt) and b['k'] in ('h','u','tool','n','comp') :
            nb,nc,_=nxt[i]
            tb=TABLE[nb]
            mine=btext(b); theirs=btext(tb)
            if tb['k']==b['k'] and mine!=theirs and theirs.startswith(mine) and len(theirs)-len(mine)<400:
                full=tb; cnt=len(mine)
        row.append((tid(full),cnt,o))
    out.append((n,t,code,row)); nxt=row
out.reverse()
# segments: merge identical consecutive frames
segs=[]
for n,t,code,row in out:
    r=[[a,c,o] if (c>=0 or o!=1.0) else a for a,c,o in row]
    s=[round(t,3), 1 if code else 0, r]
    if segs and segs[-1][1:]==s[1:]: continue
    segs.append(s)
J={'blocks':TABLE,'frames':segs}
s=json.dumps(J,ensure_ascii=False,separators=(',',':'))
open('/workspace/v060/rec/chat.json','w').write(s)
import zlib; print(len(TABLE),len(segs),len(s),len(zlib.compress(s.encode(),9)))
