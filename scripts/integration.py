"""Run only against a fresh, isolated integration database and private PHP server."""
import urllib.request, urllib.error, http.cookiejar, json, secrets, base64, sys, re
base=sys.argv[1].rstrip('/')
token=open(sys.argv[2]).read().strip()
jar=http.cookiejar.CookieJar(); client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
csrf=''
def call(action,data=None,status=200,send_csrf=True,files=None):
    headers={}
    if data is not None:
        if files:
            boundary='Maestro'+secrets.token_hex(12);chunks=[]
            for k,v in data.items():chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
            for k,(name,mime,body) in files.items():chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()+body+b'\r\n')
            payload=b''.join(chunks)+f'--{boundary}--\r\n'.encode();headers['Content-Type']='multipart/form-data; boundary='+boundary
        else:payload=json.dumps(data).encode();headers['Content-Type']='application/json'
        if send_csrf:headers['X-CSRF-Token']=csrf
    else:payload=None
    try:
        response=client.open(urllib.request.Request(base+'/api/index.php?action='+action,data=payload,headers=headers));code=response.status;body=response.read()
    except urllib.error.HTTPError as e:code=e.code;body=e.read()
    assert code==status,(action,code,status,body[:300])
    return json.loads(body)
session=call('session');csrf=session['csrf'];assert session['setupRequired']
call('pizzas',status=401)
call('hours',status=401)
call('save-hours',{'days':[], 'version':1},status=401)
call('delete',{'id':1,'version':1},status=401)
call('setup',{'username':'integration-admin','password':'Maestro-Integration-2026!','token':token},status=403,send_csrf=False)
session=call('setup',{'username':'integration-admin','password':'Maestro-Integration-2026!','token':token});csrf=session['csrf']
call('setup',{'username':'second-admin','password':'Maestro-Integration-2026!','token':token},status=403)
pizzas=call('pizzas')['pizzas'];assert len(pizzas)==38
call('save',{'name':'','ingredients':'x','price26':'10','price33':'11','price40':'12','published':'0'},status=422)
default_payload={'id':0,'version':0,'name':'Default photo test','ingredients':'Mozzarella','price26':'10','price33':'12','price40':'14'}
default_pizza=call('save',default_payload,status=201)['pizza']
assert int(default_pizza['published'])==1
assert 'Default photo test' in client.open(base+'/menu.html').read().decode()
assert default_pizza['image']==session.get('defaultImage',call('session')['defaultImage'])
assert client.open(base+'/'+default_pizza['image']).headers['Content-Type']=='image/webp'
call('delete',{'id':default_pizza['id'],'version':default_pizza['version']})
payload={'id':'0','version':'0','name':'Test <script>alert(1)</script>','ingredients':'Mozzarella & basilic','price26':'10.20','price33':'12.30','price40':'14.40','published':'0'}
call('save',payload,status=422,files={'photo':('x.svg','image/svg+xml',b'<svg xmlns="http://www.w3.org/2000/svg"/>')})
import struct,zlib
def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',16,16,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((b'\x00'+b'\xff\xa0\x20'*16)*16))+chunk(b'IEND',b'')
created=call('save',payload,status=201,files={'photo':('pizza.png','image/png',png)})['pizza']
html=client.open(base+'/menu.html').read().decode();assert 'Test &lt;script&gt;' in html
assert int(created['published'])==1
created['published']=1
saved=call('save',created)['pizza'];assert saved['version']==2
html=client.open(base+'/menu.html').read().decode();assert 'Test &lt;script&gt;alert(1)&lt;/script&gt;' in html and '<script>alert(1)</script>' not in html
assert '10,20' in html and saved['image'] in html
call('save',created,status=409)
saved['price26']='-1';call('save',saved,status=422);saved['price26']='11.25'
saved=call('save',saved)['pizza'];assert saved['price26']=='11.25'
assert '11,25' in client.open(base+'/menu.html').read().decode()
assert client.open(base+'/'+saved['image']).headers['Content-Type']=='image/webp'
call('logout',{})
session=call('session');csrf=session['csrf'];assert session['user'] is None
call('pizzas',status=401)
call('login',{'username':'integration-admin','password':'wrong'},status=401)
session=call('login',{'username':'integration-admin','password':'Maestro-Integration-2026!'});csrf=session['csrf']
assert len(call('pizzas')['pizzas'])==39
call('delete',{'id':saved['id'],'version':saved['version']},status=403,send_csrf=False)
call('delete',{'id':saved['id'],'version':saved['version']-1},status=409)
call('delete',{'id':0,'version':1},status=422)
assert len(call('pizzas')['pizzas'])==39
call('delete',{'id':saved['id'],'version':saved['version']})
assert len(call('pizzas')['pizzas'])==38
assert not any(p['id']==saved['id'] for p in call('pizzas')['pizzas'])
assert 'Test &lt;script&gt;' not in client.open(base+'/menu.html').read().decode()
call('delete',{'id':saved['id'],'version':saved['version']},status=404)
call('save',saved,status=404)
# Opening hours are tested only against this private, disposable database.
import copy
initial=call('hours'); hours=initial['hours']; defaults=initial['defaults']
assert hours['days']==defaults and hours['version']==1
call('save-hours',hours,status=403,send_csrf=False)
invalid=[None, [], {}, defaults[:7], defaults+[[]]]
for value in invalid: call('save-hours',{'days':value,'version':1},status=422)
for slots in [[['25:00','26:00']], [['11:00','10:00']], [['11:00','11:00']], [['11:00','13:00'],['12:00','14:00']], [['11:00']], [['<script>','22:00']], [['11:00','12:00']]*3, 'closed']:
    days=copy.deepcopy(defaults); days[0]=slots
    call('save-hours',{'days':days,'version':1},status=422)
assert call('hours')['hours']==hours
days=copy.deepcopy(defaults); days[0]=[['10:15','14:45']]; days[7]=[]
saved_hours=call('save-hours',{'days':days,'version':1})['hours']
assert saved_hours['version']==2 and saved_hours['days']==days
assert call('hours')['hours']==saved_hours
for route in ['','menu.html','contact.html']:
    html=client.open(base+'/'+route).read().decode()
    assert '10h15 – 14h45' in html and 'data-hours-slot' not in html
    assert html.count('10h15 – 14h45')==(2 if route=='contact.html' else 1)
    assert '<dt>Jours fériés</dt><dd>Fermé</dd>' in html
call('save-hours',hours,status=409)
assert call('hours')['hours']==saved_hours
restored=call('save-hours',{'days':defaults,'version':2})['hours']
assert restored['version']==3 and restored['days']==defaults
html=client.open(base+'/contact.html').read().decode()
assert 'Mardi au vendredi' in html and 'Samedi, dimanche et jours fériés' in html
assert '10h15' not in html
print('PASS: shared hours defaults, auth, CSRF, invalid shape/time/order/overlap/XSS, persistence, all public slots, conflict and reset')
call('logout',{})
print('PASS: setup once, auth, CSRF, invalid data, upload validation, automatic publication, default image, XSS escaping, updates, conflict, persistence, logout/login, protected deletion, stale version, removal from public site')
