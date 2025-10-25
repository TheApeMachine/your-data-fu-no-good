var En=Object.defineProperty;var It=e=>{throw TypeError(e)};var Rn=(e,t,r)=>t in e?En(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var R=(e,t,r)=>Rn(e,typeof t!="symbol"?t+"":t,r),Ot=(e,t,r)=>t.has(e)||It("Cannot "+r);var p=(e,t,r)=>(Ot(e,t,"read from private field"),r?r.call(e):t.get(e)),A=(e,t,r)=>t.has(e)?It("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),E=(e,t,r,n)=>(Ot(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),q=(e,t,r)=>(Ot(e,t,"access private method"),r);var Mt=(e,t,r,n)=>({set _(a){E(e,t,a,r)},get _(){return p(e,t,n)}});var Pt=(e,t,r)=>(n,a)=>{let s=-1;return i(0);async function i(c){if(c<=s)throw new Error("next() called multiple times");s=c;let l,o=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&a||void 0,h)try{l=await h(n,()=>i(c+1))}catch(f){if(f instanceof Error&&t)n.error=f,l=await t(f,n),o=!0;else throw f}else n.finalized===!1&&r&&(l=await r(n));return l&&(n.finalized===!1||o)&&(n.res=l),n}},Sn=Symbol(),Cn=async(e,t=Object.create(null))=>{const{all:r=!1,dot:n=!1}=t,s=(e instanceof sn?e.raw.headers:e.headers).get("Content-Type");return s!=null&&s.startsWith("multipart/form-data")||s!=null&&s.startsWith("application/x-www-form-urlencoded")?On(e,{all:r,dot:n}):{}};async function On(e,t){const r=await e.formData();return r?kn(r,t):{}}function kn(e,t){const r=Object.create(null);return e.forEach((n,a)=>{t.all||a.endsWith("[]")?Tn(r,a,n):r[a]=n}),t.dot&&Object.entries(r).forEach(([n,a])=>{n.includes(".")&&(An(r,n,a),delete r[n])}),r}var Tn=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},An=(e,t,r)=>{let n=e;const a=t.split(".");a.forEach((s,i)=>{i===a.length-1?n[s]=r:((!n[s]||typeof n[s]!="object"||Array.isArray(n[s])||n[s]instanceof File)&&(n[s]=Object.create(null)),n=n[s])})},Zt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},jn=e=>{const{groups:t,path:r}=Nn(e),n=Zt(r);return Dn(n,t)},Nn=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,n)=>{const a=`@${n}`;return t.push([a,r]),a}),{groups:t,path:e}},Dn=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[n]=t[r];for(let a=e.length-1;a>=0;a--)if(e[a].includes(n)){e[a]=e[a].replace(n,t[r][1]);break}}return e},yt={},$n=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const n=`${e}#${t}`;return yt[n]||(r[2]?yt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:yt[n]=[e,r[1],!0]),yt[n]}return null},Nt=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},In=e=>Nt(e,decodeURI),en=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let n=r;for(;n<t.length;n++){const a=t.charCodeAt(n);if(a===37){const s=t.indexOf("?",n),i=t.slice(r,s===-1?void 0:s);return In(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(a===63)break}return t.slice(r,n)},Mn=e=>{const t=en(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...r)=>(r.length&&(t=Ke(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tn=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let n="";return t.forEach(a=>{if(a!==""&&!/\:/.test(a))n+="/"+a;else if(/\:/.test(a))if(/\?/.test(a)){r.length===0&&n===""?r.push("/"):r.push(n);const s=a.replace("?","");n+="/"+s,r.push(n)}else n+="/"+a}),r.filter((a,s,i)=>i.indexOf(a)===s)},kt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Nt(e,rn):e):e,nn=(e,t,r)=>{let n;if(!r&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const c=e.charCodeAt(i+t.length+1);if(c===61){const l=i+t.length+2,o=e.indexOf("&",l);return kt(e.slice(l,o===-1?void 0:o))}else if(c==38||isNaN(c))return"";i=e.indexOf(`&${t}`,i+1)}if(n=/[%+]/.test(e),!n)return}const a={};n??(n=/[%+]/.test(e));let s=e.indexOf("?",8);for(;s!==-1;){const i=e.indexOf("&",s+1);let c=e.indexOf("=",s);c>i&&i!==-1&&(c=-1);let l=e.slice(s+1,c===-1?i===-1?void 0:i:c);if(n&&(l=kt(l)),s=i,l==="")continue;let o;c===-1?o="":(o=e.slice(c+1,i===-1?void 0:i),n&&(o=kt(o))),r?(a[l]&&Array.isArray(a[l])||(a[l]=[]),a[l].push(o)):a[l]??(a[l]=o)}return t?a[t]:a},Pn=nn,qn=(e,t)=>nn(e,t,!0),rn=decodeURIComponent,qt=e=>Nt(e,rn),Qe,he,ke,an,on,At,Ae,Ut,sn=(Ut=class{constructor(e,t="/",r=[[]]){A(this,ke);R(this,"raw");A(this,Qe);A(this,he);R(this,"routeIndex",0);R(this,"path");R(this,"bodyCache",{});A(this,Ae,e=>{const{bodyCache:t,raw:r}=this,n=t[e];if(n)return n;const a=Object.keys(t)[0];return a?t[a].then(s=>(a==="json"&&(s=JSON.stringify(s)),new Response(s)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,E(this,he,r),E(this,Qe,{})}param(e){return e?q(this,ke,an).call(this,e):q(this,ke,on).call(this)}query(e){return Pn(this.url,e)}queries(e){return qn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,n)=>{t[n]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Cn(this,e))}json(){return p(this,Ae).call(this,"text").then(e=>JSON.parse(e))}text(){return p(this,Ae).call(this,"text")}arrayBuffer(){return p(this,Ae).call(this,"arrayBuffer")}blob(){return p(this,Ae).call(this,"blob")}formData(){return p(this,Ae).call(this,"formData")}addValidatedData(e,t){p(this,Qe)[e]=t}valid(e){return p(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Sn](){return p(this,he)}get matchedRoutes(){return p(this,he)[0].map(([[,e]])=>e)}get routePath(){return p(this,he)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,he=new WeakMap,ke=new WeakSet,an=function(e){const t=p(this,he)[0][this.routeIndex][1][e],r=q(this,ke,At).call(this,t);return r&&/\%/.test(r)?qt(r):r},on=function(){const e={},t=Object.keys(p(this,he)[0][this.routeIndex][1]);for(const r of t){const n=q(this,ke,At).call(this,p(this,he)[0][this.routeIndex][1][r]);n!==void 0&&(e[r]=/\%/.test(n)?qt(n):n)}return e},At=function(e){return p(this,he)[1]?p(this,he)[1][e]:e},Ae=new WeakMap,Ut),Ln={Stringify:1},ln=async(e,t,r,n,a)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const s=e.callbacks;return s!=null&&s.length?(a?a[0]+=e:a=[e],Promise.all(s.map(c=>c({phase:t,buffer:a,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>ln(l,t,!1,n,a))).then(()=>a[0]))):Promise.resolve(e)},Fn="text/plain; charset=UTF-8",Tt=(e,t)=>({"Content-Type":e,...t}),dt,ht,Re,Xe,Se,oe,pt,Ze,et,Fe,ft,mt,je,Ye,Wt,Hn=(Wt=class{constructor(e,t){A(this,je);A(this,dt);A(this,ht);R(this,"env",{});A(this,Re);R(this,"finalized",!1);R(this,"error");A(this,Xe);A(this,Se);A(this,oe);A(this,pt);A(this,Ze);A(this,et);A(this,Fe);A(this,ft);A(this,mt);R(this,"render",(...e)=>(p(this,Ze)??E(this,Ze,t=>this.html(t)),p(this,Ze).call(this,...e)));R(this,"setLayout",e=>E(this,pt,e));R(this,"getLayout",()=>p(this,pt));R(this,"setRenderer",e=>{E(this,Ze,e)});R(this,"header",(e,t,r)=>{this.finalized&&E(this,oe,new Response(p(this,oe).body,p(this,oe)));const n=p(this,oe)?p(this,oe).headers:p(this,Fe)??E(this,Fe,new Headers);t===void 0?n.delete(e):r!=null&&r.append?n.append(e,t):n.set(e,t)});R(this,"status",e=>{E(this,Xe,e)});R(this,"set",(e,t)=>{p(this,Re)??E(this,Re,new Map),p(this,Re).set(e,t)});R(this,"get",e=>p(this,Re)?p(this,Re).get(e):void 0);R(this,"newResponse",(...e)=>q(this,je,Ye).call(this,...e));R(this,"body",(e,t,r)=>q(this,je,Ye).call(this,e,t,r));R(this,"text",(e,t,r)=>!p(this,Fe)&&!p(this,Xe)&&!t&&!r&&!this.finalized?new Response(e):q(this,je,Ye).call(this,e,t,Tt(Fn,r)));R(this,"json",(e,t,r)=>q(this,je,Ye).call(this,JSON.stringify(e),t,Tt("application/json",r)));R(this,"html",(e,t,r)=>{const n=a=>q(this,je,Ye).call(this,a,t,Tt("text/html; charset=UTF-8",r));return typeof e=="object"?ln(e,Ln.Stringify,!1,{}).then(n):n(e)});R(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});R(this,"notFound",()=>(p(this,et)??E(this,et,()=>new Response),p(this,et).call(this,this)));E(this,dt,e),t&&(E(this,Se,t.executionCtx),this.env=t.env,E(this,et,t.notFoundHandler),E(this,mt,t.path),E(this,ft,t.matchResult))}get req(){return p(this,ht)??E(this,ht,new sn(p(this,dt),p(this,mt),p(this,ft))),p(this,ht)}get event(){if(p(this,Se)&&"respondWith"in p(this,Se))return p(this,Se);throw Error("This context has no FetchEvent")}get executionCtx(){if(p(this,Se))return p(this,Se);throw Error("This context has no ExecutionContext")}get res(){return p(this,oe)||E(this,oe,new Response(null,{headers:p(this,Fe)??E(this,Fe,new Headers)}))}set res(e){if(p(this,oe)&&e){e=new Response(e.body,e);for(const[t,r]of p(this,oe).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=p(this,oe).headers.getSetCookie();e.headers.delete("set-cookie");for(const a of n)e.headers.append("set-cookie",a)}else e.headers.set(t,r)}E(this,oe,e),this.finalized=!0}get var(){return p(this,Re)?Object.fromEntries(p(this,Re)):{}}},dt=new WeakMap,ht=new WeakMap,Re=new WeakMap,Xe=new WeakMap,Se=new WeakMap,oe=new WeakMap,pt=new WeakMap,Ze=new WeakMap,et=new WeakMap,Fe=new WeakMap,ft=new WeakMap,mt=new WeakMap,je=new WeakSet,Ye=function(e,t,r){const n=p(this,oe)?new Headers(p(this,oe).headers):p(this,Fe)??new Headers;if(typeof t=="object"&&"headers"in t){const s=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,c]of s)i.toLowerCase()==="set-cookie"?n.append(i,c):n.set(i,c)}if(r)for(const[s,i]of Object.entries(r))if(typeof i=="string")n.set(s,i);else{n.delete(s);for(const c of i)n.append(s,c)}const a=typeof t=="number"?t:(t==null?void 0:t.status)??p(this,Xe);return new Response(e,{status:a,headers:n})},Wt),Q="ALL",zn="all",Bn=["get","post","put","delete","options","patch"],cn="Can not add a route since the matcher is already built.",un=class extends Error{},Un="__COMPOSED_HANDLER",Wn=e=>e.text("404 Not Found",404),Lt=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},ge,X,hn,ye,qe,bt,vt,Jt,dn=(Jt=class{constructor(t={}){A(this,X);R(this,"get");R(this,"post");R(this,"put");R(this,"delete");R(this,"options");R(this,"patch");R(this,"all");R(this,"on");R(this,"use");R(this,"router");R(this,"getPath");R(this,"_basePath","/");A(this,ge,"/");R(this,"routes",[]);A(this,ye,Wn);R(this,"errorHandler",Lt);R(this,"onError",t=>(this.errorHandler=t,this));R(this,"notFound",t=>(E(this,ye,t),this));R(this,"fetch",(t,...r)=>q(this,X,vt).call(this,t,r[1],r[0],t.method));R(this,"request",(t,r,n,a)=>t instanceof Request?this.fetch(r?new Request(t,r):t,n,a):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,r),n,a)));R(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(q(this,X,vt).call(this,t.request,t,void 0,t.request.method))})});[...Bn,zn].forEach(s=>{this[s]=(i,...c)=>(typeof i=="string"?E(this,ge,i):q(this,X,qe).call(this,s,p(this,ge),i),c.forEach(l=>{q(this,X,qe).call(this,s,p(this,ge),l)}),this)}),this.on=(s,i,...c)=>{for(const l of[i].flat()){E(this,ge,l);for(const o of[s].flat())c.map(h=>{q(this,X,qe).call(this,o.toUpperCase(),p(this,ge),h)})}return this},this.use=(s,...i)=>(typeof s=="string"?E(this,ge,s):(E(this,ge,"*"),i.unshift(s)),i.forEach(c=>{q(this,X,qe).call(this,Q,p(this,ge),c)}),this);const{strict:n,...a}=t;Object.assign(this,a),this.getPath=n??!0?t.getPath??en:Mn}route(t,r){const n=this.basePath(t);return r.routes.map(a=>{var i;let s;r.errorHandler===Lt?s=a.handler:(s=async(c,l)=>(await Pt([],r.errorHandler)(c,()=>a.handler(c,l))).res,s[Un]=a.handler),q(i=n,X,qe).call(i,a.method,a.path,s)}),this}basePath(t){const r=q(this,X,hn).call(this);return r._basePath=Ke(this._basePath,t),r}mount(t,r,n){let a,s;n&&(typeof n=="function"?s=n:(s=n.optionHandler,n.replaceRequest===!1?a=l=>l:a=n.replaceRequest));const i=s?l=>{const o=s(l);return Array.isArray(o)?o:[o]}:l=>{let o;try{o=l.executionCtx}catch{}return[l.env,o]};a||(a=(()=>{const l=Ke(this._basePath,t),o=l==="/"?0:l.length;return h=>{const f=new URL(h.url);return f.pathname=f.pathname.slice(o)||"/",new Request(f,h)}})());const c=async(l,o)=>{const h=await r(a(l.req.raw),...i(l));if(h)return h;await o()};return q(this,X,qe).call(this,Q,Ke(t,"*"),c),this}},ge=new WeakMap,X=new WeakSet,hn=function(){const t=new dn({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,E(t,ye,p(this,ye)),t.routes=this.routes,t},ye=new WeakMap,qe=function(t,r,n){t=t.toUpperCase(),r=Ke(this._basePath,r);const a={basePath:this._basePath,path:r,method:t,handler:n};this.router.add(t,r,[n,a]),this.routes.push(a)},bt=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},vt=function(t,r,n,a){if(a==="HEAD")return(async()=>new Response(null,await q(this,X,vt).call(this,t,r,n,"GET")))();const s=this.getPath(t,{env:n}),i=this.router.match(a,s),c=new Hn(t,{path:s,matchResult:i,env:n,executionCtx:r,notFoundHandler:p(this,ye)});if(i[0].length===1){let o;try{o=i[0][0][0][0](c,async()=>{c.res=await p(this,ye).call(this,c)})}catch(h){return q(this,X,bt).call(this,h,c)}return o instanceof Promise?o.then(h=>h||(c.finalized?c.res:p(this,ye).call(this,c))).catch(h=>q(this,X,bt).call(this,h,c)):o??p(this,ye).call(this,c)}const l=Pt(i[0],this.errorHandler,p(this,ye));return(async()=>{try{const o=await l(c);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return q(this,X,bt).call(this,o,c)}})()},Jt),pn=[];function Jn(e,t){const r=this.buildAllMatchers(),n=(a,s)=>{const i=r[a]||r[Q],c=i[2][s];if(c)return c;const l=s.match(i[0]);if(!l)return[[],pn];const o=l.indexOf("",1);return[i[1][o],l]};return this.match=n,n(e,t)}var wt="[^/]+",lt=".*",ct="(?:|/.*)",Ge=Symbol(),Vn=new Set(".\\+*[^]$()");function Kn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===lt||e===ct?1:t===lt||t===ct?-1:e===wt?1:t===wt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,ze,be,Vt,jt=(Vt=class{constructor(){A(this,He);A(this,ze);A(this,be,Object.create(null))}insert(t,r,n,a,s){if(t.length===0){if(p(this,He)!==void 0)throw Ge;if(s)return;E(this,He,r);return}const[i,...c]=t,l=i==="*"?c.length===0?["","",lt]:["","",wt]:i==="/*"?["","",ct]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(l){const h=l[1];let f=l[2]||wt;if(h&&l[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))))throw Ge;if(o=p(this,be)[f],!o){if(Object.keys(p(this,be)).some(g=>g!==lt&&g!==ct))throw Ge;if(s)return;o=p(this,be)[f]=new jt,h!==""&&E(o,ze,a.varIndex++)}!s&&h!==""&&n.push([h,p(o,ze)])}else if(o=p(this,be)[i],!o){if(Object.keys(p(this,be)).some(h=>h.length>1&&h!==lt&&h!==ct))throw Ge;if(s)return;o=p(this,be)[i]=new jt}o.insert(c,r,n,a,s)}buildRegExpStr(){const r=Object.keys(p(this,be)).sort(Kn).map(n=>{const a=p(this,be)[n];return(typeof p(a,ze)=="number"?`(${n})@${p(a,ze)}`:Vn.has(n)?`\\${n}`:n)+a.buildRegExpStr()});return typeof p(this,He)=="number"&&r.unshift(`#${p(this,He)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},He=new WeakMap,ze=new WeakMap,be=new WeakMap,Vt),Et,gt,Kt,Yn=(Kt=class{constructor(){A(this,Et,{varIndex:0});A(this,gt,new jt)}insert(e,t,r){const n=[],a=[];for(let i=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const o=`@\\${i}`;return a[i]=[o,l],i++,c=!0,o}),!c)break}const s=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=a.length-1;i>=0;i--){const[c]=a[i];for(let l=s.length-1;l>=0;l--)if(s[l].indexOf(c)!==-1){s[l]=s[l].replace(c,a[i][1]);break}}return p(this,gt).insert(s,t,n,p(this,Et),r),n}buildRegExp(){let e=p(this,gt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(a,s,i)=>s!==void 0?(r[++t]=Number(s),"$()"):(i!==void 0&&(n[Number(i)]=++t),"")),[new RegExp(`^${e}`),r,n]}},Et=new WeakMap,gt=new WeakMap,Kt),Gn=[/^$/,[],Object.create(null)],_t=Object.create(null);function fn(e){return _t[e]??(_t[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Qn(){_t=Object.create(null)}function Xn(e){var o;const t=new Yn,r=[];if(e.length===0)return Gn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,f],[g,y])=>h?1:g?-1:f.length-y.length),a=Object.create(null);for(let h=0,f=-1,g=n.length;h<g;h++){const[y,_,x]=n[h];y?a[_]=[x.map(([L])=>[L,Object.create(null)]),pn]:f++;let D;try{D=t.insert(_,f,y)}catch(L){throw L===Ge?new un(_):L}y||(r[f]=x.map(([L,re])=>{const pe=Object.create(null);for(re-=1;re>=0;re--){const[J,fe]=D[re];pe[J]=fe}return[L,pe]}))}const[s,i,c]=t.buildRegExp();for(let h=0,f=r.length;h<f;h++)for(let g=0,y=r[h].length;g<y;g++){const _=(o=r[h][g])==null?void 0:o[1];if(!_)continue;const x=Object.keys(_);for(let D=0,L=x.length;D<L;D++)_[x[D]]=c[_[x[D]]]}const l=[];for(const h in i)l[h]=r[i[h]];return[s,l,a]}function Ve(e,t){if(e){for(const r of Object.keys(e).sort((n,a)=>a.length-n.length))if(fn(r).test(t))return[...e[r]]}}var Ne,De,Rt,mn,Yt,Zn=(Yt=class{constructor(){A(this,Rt);R(this,"name","RegExpRouter");A(this,Ne);A(this,De);R(this,"match",Jn);E(this,Ne,{[Q]:Object.create(null)}),E(this,De,{[Q]:Object.create(null)})}add(e,t,r){var c;const n=p(this,Ne),a=p(this,De);if(!n||!a)throw new Error(cn);n[e]||[n,a].forEach(l=>{l[e]=Object.create(null),Object.keys(l[Q]).forEach(o=>{l[e][o]=[...l[Q][o]]})}),t==="/*"&&(t="*");const s=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=fn(t);e===Q?Object.keys(n).forEach(o=>{var h;(h=n[o])[t]||(h[t]=Ve(n[o],t)||Ve(n[Q],t)||[])}):(c=n[e])[t]||(c[t]=Ve(n[e],t)||Ve(n[Q],t)||[]),Object.keys(n).forEach(o=>{(e===Q||e===o)&&Object.keys(n[o]).forEach(h=>{l.test(h)&&n[o][h].push([r,s])})}),Object.keys(a).forEach(o=>{(e===Q||e===o)&&Object.keys(a[o]).forEach(h=>l.test(h)&&a[o][h].push([r,s]))});return}const i=tn(t)||[t];for(let l=0,o=i.length;l<o;l++){const h=i[l];Object.keys(a).forEach(f=>{var g;(e===Q||e===f)&&((g=a[f])[h]||(g[h]=[...Ve(n[f],h)||Ve(n[Q],h)||[]]),a[f][h].push([r,s-o+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(p(this,De)).concat(Object.keys(p(this,Ne))).forEach(t=>{e[t]||(e[t]=q(this,Rt,mn).call(this,t))}),E(this,Ne,E(this,De,void 0)),Qn(),e}},Ne=new WeakMap,De=new WeakMap,Rt=new WeakSet,mn=function(e){const t=[];let r=e===Q;return[p(this,Ne),p(this,De)].forEach(n=>{const a=n[e]?Object.keys(n[e]).map(s=>[s,n[e][s]]):[];a.length!==0?(r||(r=!0),t.push(...a)):e!==Q&&t.push(...Object.keys(n[Q]).map(s=>[s,n[Q][s]]))}),r?Xn(t):null},Yt),$e,Ce,Gt,er=(Gt=class{constructor(e){R(this,"name","SmartRouter");A(this,$e,[]);A(this,Ce,[]);E(this,$e,e.routers)}add(e,t,r){if(!p(this,Ce))throw new Error(cn);p(this,Ce).push([e,t,r])}match(e,t){if(!p(this,Ce))throw new Error("Fatal error");const r=p(this,$e),n=p(this,Ce),a=r.length;let s=0,i;for(;s<a;s++){const c=r[s];try{for(let l=0,o=n.length;l<o;l++)c.add(...n[l]);i=c.match(e,t)}catch(l){if(l instanceof un)continue;throw l}this.match=c.match.bind(c),E(this,$e,[c]),E(this,Ce,void 0);break}if(s===a)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(p(this,Ce)||p(this,$e).length!==1)throw new Error("No active router has been determined yet.");return p(this,$e)[0]}},$e=new WeakMap,Ce=new WeakMap,Gt),at=Object.create(null),Ie,ie,Be,tt,ne,Oe,Le,Qt,gn=(Qt=class{constructor(e,t,r){A(this,Oe);A(this,Ie);A(this,ie);A(this,Be);A(this,tt,0);A(this,ne,at);if(E(this,ie,r||Object.create(null)),E(this,Ie,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},E(this,Ie,[n])}E(this,Be,[])}insert(e,t,r){E(this,tt,++Mt(this,tt)._);let n=this;const a=jn(t),s=[];for(let i=0,c=a.length;i<c;i++){const l=a[i],o=a[i+1],h=$n(l,o),f=Array.isArray(h)?h[0]:l;if(f in p(n,ie)){n=p(n,ie)[f],h&&s.push(h[1]);continue}p(n,ie)[f]=new gn,h&&(p(n,Be).push(h),s.push(h[1])),n=p(n,ie)[f]}return p(n,Ie).push({[e]:{handler:r,possibleKeys:s.filter((i,c,l)=>l.indexOf(i)===c),score:p(this,tt)}}),n}search(e,t){var c;const r=[];E(this,ne,at);let a=[this];const s=Zt(t),i=[];for(let l=0,o=s.length;l<o;l++){const h=s[l],f=l===o-1,g=[];for(let y=0,_=a.length;y<_;y++){const x=a[y],D=p(x,ie)[h];D&&(E(D,ne,p(x,ne)),f?(p(D,ie)["*"]&&r.push(...q(this,Oe,Le).call(this,p(D,ie)["*"],e,p(x,ne))),r.push(...q(this,Oe,Le).call(this,D,e,p(x,ne)))):g.push(D));for(let L=0,re=p(x,Be).length;L<re;L++){const pe=p(x,Be)[L],J=p(x,ne)===at?{}:{...p(x,ne)};if(pe==="*"){const m=p(x,ie)["*"];m&&(r.push(...q(this,Oe,Le).call(this,m,e,p(x,ne))),E(m,ne,J),g.push(m));continue}const[fe,ee,T]=pe;if(!h&&!(T instanceof RegExp))continue;const u=p(x,ie)[fe],d=s.slice(l).join("/");if(T instanceof RegExp){const m=T.exec(d);if(m){if(J[ee]=m[0],r.push(...q(this,Oe,Le).call(this,u,e,p(x,ne),J)),Object.keys(p(u,ie)).length){E(u,ne,J);const b=((c=m[0].match(/\//))==null?void 0:c.length)??0;(i[b]||(i[b]=[])).push(u)}continue}}(T===!0||T.test(h))&&(J[ee]=h,f?(r.push(...q(this,Oe,Le).call(this,u,e,J,p(x,ne))),p(u,ie)["*"]&&r.push(...q(this,Oe,Le).call(this,p(u,ie)["*"],e,J,p(x,ne)))):(E(u,ne,J),g.push(u)))}}a=g.concat(i.shift()??[])}return r.length>1&&r.sort((l,o)=>l.score-o.score),[r.map(({handler:l,params:o})=>[l,o])]}},Ie=new WeakMap,ie=new WeakMap,Be=new WeakMap,tt=new WeakMap,ne=new WeakMap,Oe=new WeakSet,Le=function(e,t,r,n){const a=[];for(let s=0,i=p(e,Ie).length;s<i;s++){const c=p(e,Ie)[s],l=c[t]||c[Q],o={};if(l!==void 0&&(l.params=Object.create(null),a.push(l),r!==at||n&&n!==at))for(let h=0,f=l.possibleKeys.length;h<f;h++){const g=l.possibleKeys[h],y=o[l.score];l.params[g]=n!=null&&n[g]&&!y?n[g]:r[g]??(n==null?void 0:n[g]),o[l.score]=!0}}return a},Qt),Ue,Xt,tr=(Xt=class{constructor(){R(this,"name","TrieRouter");A(this,Ue);E(this,Ue,new gn)}add(e,t,r){const n=tn(t);if(n){for(let a=0,s=n.length;a<s;a++)p(this,Ue).insert(e,n[a],r);return}p(this,Ue).insert(e,t,r)}match(e,t){return p(this,Ue).search(e,t)}},Ue=new WeakMap,Xt),Pe=class extends dn{constructor(e={}){super(e),this.router=e.router??new er({routers:[new Zn,new tr]})}},nr=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(s=>typeof s=="string"?s==="*"?()=>s:i=>s===i?i:null:typeof s=="function"?s:i=>s.includes(i)?i:null)(r.origin),a=(s=>typeof s=="function"?s:Array.isArray(s)?()=>s:()=>[])(r.allowMethods);return async function(i,c){var h;function l(f,g){i.res.headers.set(f,g)}const o=await n(i.req.header("origin")||"",i);if(o&&l("Access-Control-Allow-Origin",o),r.origin!=="*"){const f=i.req.header("Vary");f?l("Vary",f):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),i.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const f=await a(i.req.header("origin")||"",i);f.length&&l("Access-Control-Allow-Methods",f.join(","));let g=r.allowHeaders;if(!(g!=null&&g.length)){const y=i.req.header("Access-Control-Request-Headers");y&&(g=y.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await c()}},rr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Ft=(e,t=ar)=>{const r=/\.([a-zA-Z0-9]+?)$/,n=e.match(r);if(!n)return;let a=t[n[1]];return a&&a.startsWith("text")&&(a+="; charset=utf-8"),a},sr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ar=sr,ir=(...e)=>{let t=e.filter(a=>a!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),n=[];for(const a of r)a===".."&&n.length>0&&n.at(-1)!==".."?n.pop():a!=="."&&n.push(a);return n.join("/")||"."},yn={br:".br",zstd:".zst",gzip:".gz"},or=Object.keys(yn),lr="index.html",cr=e=>{const t=e.root??"./",r=e.path,n=e.join??ir;return async(a,s)=>{var h,f,g,y;if(a.finalized)return s();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(a.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,a.req.path,a)),s()}let c=n(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(c)&&(c=n(c,lr));const l=e.getContent;let o=await l(c,a);if(o instanceof Response)return a.newResponse(o.body,o);if(o){const _=e.mimes&&Ft(c,e.mimes)||Ft(c);if(a.header("Content-Type",_||"application/octet-stream"),e.precompressed&&(!_||rr.test(_))){const x=new Set((f=a.req.header("Accept-Encoding"))==null?void 0:f.split(",").map(D=>D.trim()));for(const D of or){if(!x.has(D))continue;const L=await l(c+yn[D],a);if(L){o=L,a.header("Content-Encoding",D),a.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,a)),a.body(o)}await((y=e.onNotFound)==null?void 0:y.call(e,c,a)),await s()}},ur=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const a=r[e]||e;if(!a)return null;const s=await n.get(a,{type:"stream"});return s||null},dr=e=>async function(r,n){return cr({...e,getContent:async s=>ur(s,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,n)},hr=e=>dr(e);function pr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var xt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var fr=xt.exports,Ht;function mr(){return Ht||(Ht=1,(function(e,t){((r,n)=>{e.exports=n()})(fr,function r(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},a,s=!n.document&&!!n.postMessage,i=n.IS_PAPA_WORKER||!1,c={},l=0,o={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var m=fe(d);m.chunkSize=parseInt(m.chunkSize),d.step||d.chunk||(m.chunkSize=null),this._handle=new x(m),(this._handle.streamer=this)._config=m}).call(this,u),this.parseChunk=function(d,m){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let j=this._config.newline;j||(v=this._config.quoteChar||'"',j=this._handle.guessLineEndings(d,v)),d=[...d.split(j).slice(b)].join(j)}this.isFirstChunk&&T(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),i)n.postMessage({results:v,workerId:o.WORKER_ID,finished:b});else if(T(this._config.chunk)&&!m){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!T(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){T(this._config.error)?this._config.error(d):i&&this._config.error&&n.postMessage({workerId:o.WORKER_ID,error:d,finished:!1})}}function f(u){var d;(u=u||{}).chunkSize||(u.chunkSize=o.RemoteChunkSize),h.call(this,u),this._nextChunk=s?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(m){this._input=m,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),s||(d.onload=ee(this._chunkLoaded,this),d.onerror=ee(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!s),this._config.downloadRequestHeaders){var m,b=this._config.downloadRequestHeaders;for(m in b)d.setRequestHeader(m,b[m])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(j){this._chunkError(j.message)}s&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(m=>(m=m.getResponseHeader("Content-Range"))!==null?parseInt(m.substring(m.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(m){m=d.statusText||m,this._sendError(new Error(m))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=o.LocalChunkSize),h.call(this,u);var d,m,b=typeof FileReader<"u";this.stream=function(v){this._input=v,m=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=ee(this._chunkLoaded,this),d.onerror=ee(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,j=(this._config.chunkSize&&(j=Math.min(this._start+this._config.chunkSize,this._input.size),v=m.call(v,this._start,j)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:j}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(m){return d=m,this._nextChunk()},this._nextChunk=function(){var m,b;if(!this._finished)return m=this._config.chunkSize,d=m?(b=d.substring(0,m),d.substring(m)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function _(u){h.call(this,u=u||{});var d=[],m=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):m=!0},this._streamData=ee(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),m&&(m=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(j){this._streamError(j)}},this),this._streamError=ee(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=ee(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=ee(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function x(u){var d,m,b,v,j=Math.pow(2,53),K=-j,ce=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ue=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,N=this,B=0,S=0,se=!1,O=!1,$=[],w={data:[],errors:[],meta:{}};function Y(I){return u.skipEmptyLines==="greedy"?I.join("").trim()==="":I.length===1&&I[0].length===0}function V(){if(w&&b&&(de("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+o.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(w.data=w.data.filter(function(C){return!Y(C)})),te()){let C=function(W,G){T(u.transformHeader)&&(W=u.transformHeader(W,G)),$.push(W)};if(w)if(Array.isArray(w.data[0])){for(var I=0;te()&&I<w.data.length;I++)w.data[I].forEach(C);w.data.splice(0,1)}else w.data.forEach(C)}function P(C,W){for(var G=u.header?{}:[],F=0;F<C.length;F++){var H=F,M=C[F],M=((me,k)=>(z=>(u.dynamicTypingFunction&&u.dynamicTyping[z]===void 0&&(u.dynamicTyping[z]=u.dynamicTypingFunction(z)),(u.dynamicTyping[z]||u.dynamicTyping)===!0))(me)?k==="true"||k==="TRUE"||k!=="false"&&k!=="FALSE"&&((z=>{if(ce.test(z)&&(z=parseFloat(z),K<z&&z<j))return 1})(k)?parseFloat(k):ue.test(k)?new Date(k):k===""?null:k):k)(H=u.header?F>=$.length?"__parsed_extra":$[F]:H,M=u.transform?u.transform(M,H):M);H==="__parsed_extra"?(G[H]=G[H]||[],G[H].push(M)):G[H]=M}return u.header&&(F>$.length?de("FieldMismatch","TooManyFields","Too many fields: expected "+$.length+" fields but parsed "+F,S+W):F<$.length&&de("FieldMismatch","TooFewFields","Too few fields: expected "+$.length+" fields but parsed "+F,S+W)),G}var U;w&&(u.header||u.dynamicTyping||u.transform)&&(U=1,!w.data.length||Array.isArray(w.data[0])?(w.data=w.data.map(P),U=w.data.length):w.data=P(w.data,0),u.header&&w.meta&&(w.meta.fields=$),S+=U)}function te(){return u.header&&$.length===0}function de(I,P,U,C){I={type:I,code:P,message:U},C!==void 0&&(I.row=C),w.errors.push(I)}T(u.step)&&(v=u.step,u.step=function(I){w=I,te()?V():(V(),w.data.length!==0&&(B+=I.data.length,u.preview&&B>u.preview?m.abort():(w.data=w.data[0],v(w,N))))}),this.parse=function(I,P,U){var C=u.quoteChar||'"',C=(u.newline||(u.newline=this.guessLineEndings(I,C)),b=!1,u.delimiter?T(u.delimiter)&&(u.delimiter=u.delimiter(I),w.meta.delimiter=u.delimiter):((C=((W,G,F,H,M)=>{var me,k,z,Te;M=M||[",","	","|",";",o.RECORD_SEP,o.UNIT_SEP];for(var We=0;We<M.length;We++){for(var _e,rt=M[We],ae=0,xe=0,Z=0,le=(z=void 0,new L({comments:H,delimiter:rt,newline:G,preview:10}).parse(W)),Ee=0;Ee<le.data.length;Ee++)F&&Y(le.data[Ee])?Z++:(_e=le.data[Ee].length,xe+=_e,z===void 0?z=_e:0<_e&&(ae+=Math.abs(_e-z),z=_e));0<le.data.length&&(xe/=le.data.length-Z),(k===void 0||ae<=k)&&(Te===void 0||Te<xe)&&1.99<xe&&(k=ae,me=rt,Te=xe)}return{successful:!!(u.delimiter=me),bestDelimiter:me}})(I,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=C.bestDelimiter:(b=!0,u.delimiter=o.DefaultDelimiter),w.meta.delimiter=u.delimiter),fe(u));return u.preview&&u.header&&C.preview++,d=I,m=new L(C),w=m.parse(d,P,U),V(),se?{meta:{paused:!0}}:w||{meta:{paused:!1}}},this.paused=function(){return se},this.pause=function(){se=!0,m.abort(),d=T(u.chunk)?"":d.substring(m.getCharIndex())},this.resume=function(){N.streamer._halted?(se=!1,N.streamer.parseChunk(d,!0)):setTimeout(N.resume,3)},this.aborted=function(){return O},this.abort=function(){O=!0,m.abort(),w.meta.aborted=!0,T(u.complete)&&u.complete(w),d=""},this.guessLineEndings=function(W,C){W=W.substring(0,1048576);var C=new RegExp(D(C)+"([^]*?)"+D(C),"gm"),U=(W=W.replace(C,"")).split("\r"),C=W.split(`
`),W=1<C.length&&C[0].length<U[0].length;if(U.length===1||W)return`
`;for(var G=0,F=0;F<U.length;F++)U[F][0]===`
`&&G++;return G>=U.length/2?`\r
`:"\r"}}function D(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function L(u){var d=(u=u||{}).delimiter,m=u.newline,b=u.comments,v=u.step,j=u.preview,K=u.fastMode,ce=null,ue=!1,N=u.quoteChar==null?'"':u.quoteChar,B=N;if(u.escapeChar!==void 0&&(B=u.escapeChar),(typeof d!="string"||-1<o.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<o.BAD_DELIMITERS.indexOf(b))&&(b=!1),m!==`
`&&m!=="\r"&&m!==`\r
`&&(m=`
`);var S=0,se=!1;this.parse=function(O,$,w){if(typeof O!="string")throw new Error("Input must be a string");var Y=O.length,V=d.length,te=m.length,de=b.length,I=T(v),P=[],U=[],C=[],W=S=0;if(!O)return ae();if(K||K!==!1&&O.indexOf(N)===-1){for(var G=O.split(m),F=0;F<G.length;F++){if(C=G[F],S+=C.length,F!==G.length-1)S+=m.length;else if(w)return ae();if(!b||C.substring(0,de)!==b){if(I){if(P=[],Te(C.split(d)),xe(),se)return ae()}else Te(C.split(d));if(j&&j<=F)return P=P.slice(0,j),ae(!0)}}return ae()}for(var H=O.indexOf(d,S),M=O.indexOf(m,S),me=new RegExp(D(B)+D(N),"g"),k=O.indexOf(N,S);;)if(O[S]===N)for(k=S,S++;;){if((k=O.indexOf(N,k+1))===-1)return w||U.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:P.length,index:S}),_e();if(k===Y-1)return _e(O.substring(S,k).replace(me,N));if(N===B&&O[k+1]===B)k++;else if(N===B||k===0||O[k-1]!==B){H!==-1&&H<k+1&&(H=O.indexOf(d,k+1));var z=We((M=M!==-1&&M<k+1?O.indexOf(m,k+1):M)===-1?H:Math.min(H,M));if(O.substr(k+1+z,V)===d){C.push(O.substring(S,k).replace(me,N)),O[S=k+1+z+V]!==N&&(k=O.indexOf(N,S)),H=O.indexOf(d,S),M=O.indexOf(m,S);break}if(z=We(M),O.substring(k+1+z,k+1+z+te)===m){if(C.push(O.substring(S,k).replace(me,N)),rt(k+1+z+te),H=O.indexOf(d,S),k=O.indexOf(N,S),I&&(xe(),se))return ae();if(j&&P.length>=j)return ae(!0);break}U.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:P.length,index:S}),k++}}else if(b&&C.length===0&&O.substring(S,S+de)===b){if(M===-1)return ae();S=M+te,M=O.indexOf(m,S),H=O.indexOf(d,S)}else if(H!==-1&&(H<M||M===-1))C.push(O.substring(S,H)),S=H+V,H=O.indexOf(d,S);else{if(M===-1)break;if(C.push(O.substring(S,M)),rt(M+te),I&&(xe(),se))return ae();if(j&&P.length>=j)return ae(!0)}return _e();function Te(Z){P.push(Z),W=S}function We(Z){var le=0;return le=Z!==-1&&(Z=O.substring(k+1,Z))&&Z.trim()===""?Z.length:le}function _e(Z){return w||(Z===void 0&&(Z=O.substring(S)),C.push(Z),S=Y,Te(C),I&&xe()),ae()}function rt(Z){S=Z,Te(C),C=[],M=O.indexOf(m,S)}function ae(Z){if(u.header&&!$&&P.length&&!ue){var le=P[0],Ee=Object.create(null),Ct=new Set(le);let Dt=!1;for(let Je=0;Je<le.length;Je++){let we=le[Je];if(Ee[we=T(u.transformHeader)?u.transformHeader(we,Je):we]){let st,$t=Ee[we];for(;st=we+"_"+$t,$t++,Ct.has(st););Ct.add(st),le[Je]=st,Ee[we]++,Dt=!0,(ce=ce===null?{}:ce)[st]=we}else Ee[we]=1,le[Je]=we;Ct.add(we)}Dt&&console.warn("Duplicate headers found and renamed."),ue=!0}return{data:P,errors:U,meta:{delimiter:d,linebreak:m,aborted:se,truncated:!!Z,cursor:W+($||0),renamedHeaders:ce}}}function xe(){v(ae()),P=[],U=[]}},this.abort=function(){se=!0},this.getCharIndex=function(){return S}}function re(u){var d=u.data,m=c[d.workerId],b=!1;if(d.error)m.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,pe(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:J,resume:J};if(T(m.userStep)){for(var j=0;j<d.results.data.length&&(m.userStep({data:d.results.data[j],errors:d.results.errors,meta:d.results.meta},v),!b);j++);delete d.results}else T(m.userChunk)&&(m.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&pe(d.workerId,d.results)}function pe(u,d){var m=c[u];T(m.userComplete)&&m.userComplete(d),m.terminate(),delete c[u]}function J(){throw new Error("Not implemented.")}function fe(u){if(typeof u!="object"||u===null)return u;var d,m=Array.isArray(u)?[]:{};for(d in u)m[d]=fe(u[d]);return m}function ee(u,d){return function(){u.apply(d,arguments)}}function T(u){return typeof u=="function"}return o.parse=function(u,d){var m=(d=d||{}).dynamicTyping||!1;if(T(m)&&(d.dynamicTypingFunction=m,m={}),d.dynamicTyping=m,d.transform=!!T(d.transform)&&d.transform,!d.worker||!o.WORKERS_SUPPORTED)return m=null,o.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),m=new(d.download?f:y)(d)):u.readable===!0&&T(u.read)&&T(u.on)?m=new _(d):(n.File&&u instanceof File||u instanceof Object)&&(m=new g(d)),m.stream(u);(m=(()=>{var b;return!!o.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,j=r.toString();return o.BLOB_URL||(o.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",j,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=re,b.id=l++,c[b.id]=b)})()).userStep=d.step,m.userChunk=d.chunk,m.userComplete=d.complete,m.userError=d.error,d.step=T(d.step),d.chunk=T(d.chunk),d.complete=T(d.complete),d.error=T(d.error),delete d.worker,m.postMessage({input:u,config:d,workerId:m.id})},o.unparse=function(u,d){var m=!1,b=!0,v=",",j=`\r
`,K='"',ce=K+K,ue=!1,N=null,B=!1,S=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||o.BAD_DELIMITERS.filter(function($){return d.delimiter.indexOf($)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(m=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(ue=d.skipEmptyLines),typeof d.newline=="string"&&(j=d.newline),typeof d.quoteChar=="string"&&(K=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");N=d.columns}d.escapeChar!==void 0&&(ce=d.escapeChar+K),d.escapeFormulae instanceof RegExp?B=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(B=/^[=+\-@\t\r].*$/)}})(),new RegExp(D(K),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return se(null,u,ue);if(typeof u[0]=="object")return se(N||Object.keys(u[0]),u,ue)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||N),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),se(u.fields||[],u.data||[],ue);throw new Error("Unable to serialize unrecognized input");function se($,w,Y){var V="",te=(typeof $=="string"&&($=JSON.parse($)),typeof w=="string"&&(w=JSON.parse(w)),Array.isArray($)&&0<$.length),de=!Array.isArray(w[0]);if(te&&b){for(var I=0;I<$.length;I++)0<I&&(V+=v),V+=O($[I],I);0<w.length&&(V+=j)}for(var P=0;P<w.length;P++){var U=(te?$:w[P]).length,C=!1,W=te?Object.keys(w[P]).length===0:w[P].length===0;if(Y&&!te&&(C=Y==="greedy"?w[P].join("").trim()==="":w[P].length===1&&w[P][0].length===0),Y==="greedy"&&te){for(var G=[],F=0;F<U;F++){var H=de?$[F]:F;G.push(w[P][H])}C=G.join("").trim()===""}if(!C){for(var M=0;M<U;M++){0<M&&!W&&(V+=v);var me=te&&de?$[M]:M;V+=O(w[P][me],M)}P<w.length-1&&(!Y||0<U&&!W)&&(V+=j)}}return V}function O($,w){var Y,V;return $==null?"":$.constructor===Date?JSON.stringify($).slice(1,25):(V=!1,B&&typeof $=="string"&&B.test($)&&($="'"+$,V=!0),Y=$.toString().replace(S,ce),(V=V||m===!0||typeof m=="function"&&m($,w)||Array.isArray(m)&&m[w]||((te,de)=>{for(var I=0;I<de.length;I++)if(-1<te.indexOf(de[I]))return!0;return!1})(Y,o.BAD_DELIMITERS)||-1<Y.indexOf(v)||Y.charAt(0)===" "||Y.charAt(Y.length-1)===" ")?K+Y+K:Y)}},o.RECORD_SEP="",o.UNIT_SEP="",o.BYTE_ORDER_MARK="\uFEFF",o.BAD_DELIMITERS=["\r",`
`,'"',o.BYTE_ORDER_MARK],o.WORKERS_SUPPORTED=!s&&!!n.Worker,o.NODE_STREAM_INPUT=1,o.LocalChunkSize=10485760,o.RemoteChunkSize=5242880,o.DefaultDelimiter=",",o.Parser=L,o.ParserHandle=x,o.NetworkStreamer=f,o.FileStreamer=g,o.StringStreamer=y,o.ReadableStreamStreamer=_,n.jQuery&&((a=n.jQuery).fn.parse=function(u){var d=u.config||{},m=[];return this.each(function(j){if(!(a(this).prop("tagName").toUpperCase()==="INPUT"&&a(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var K=0;K<this.files.length;K++)m.push({file:this.files[K],inputElem:this,instanceConfig:a.extend({},d)})}),b(),this;function b(){if(m.length===0)T(u.complete)&&u.complete();else{var j,K,ce,ue,N=m[0];if(T(u.before)){var B=u.before(N.file,N.inputElem);if(typeof B=="object"){if(B.action==="abort")return j="AbortError",K=N.file,ce=N.inputElem,ue=B.reason,void(T(u.error)&&u.error({name:j},K,ce,ue));if(B.action==="skip")return void v();typeof B.config=="object"&&(N.instanceConfig=a.extend(N.instanceConfig,B.config))}else if(B==="skip")return void v()}var S=N.instanceConfig.complete;N.instanceConfig.complete=function(se){T(S)&&S(se,N.file,N.inputElem),v()},o.parse(N.file,N.instanceConfig)}}function v(){m.splice(0,1),b()}}),i&&(n.onmessage=function(u){u=u.data,o.WORKER_ID===void 0&&u&&(o.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:o.WORKER_ID,results:o.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=o.parse(u.input,u.config))&&n.postMessage({workerId:o.WORKER_ID,results:u,finished:!0})}),(f.prototype=Object.create(h.prototype)).constructor=f,(g.prototype=Object.create(h.prototype)).constructor=g,(y.prototype=Object.create(y.prototype)).constructor=y,(_.prototype=Object.create(h.prototype)).constructor=_,o})})(xt)),xt.exports}var gr=mr();const yr=pr(gr);function br(e,t={}){const{maxRows:r=1e4}=t,n=yr.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:a=>a.trim(),preview:r});return n.errors.length>0&&console.warn("CSV parsing warnings:",n.errors.slice(0,5)),n.data}function vr(e){if(e.length===0)return{};const t=Object.keys(e[0]),r={};for(const n of t){const a=e.slice(0,Math.min(100,e.length)).map(s=>s[n]);r[n]=_r(a)}return r}function _r(e){const t=e.filter(s=>s!=null&&s!=="");if(t.length===0)return"string";if(t.filter(s=>typeof s=="number"&&!isNaN(s)).length===t.length)return"number";if(t.filter(s=>typeof s=="boolean").length===t.length)return"boolean";const a=t.filter(s=>{if(typeof s=="string"){const i=Date.parse(s);return!isNaN(i)}return!1}).length;return a===t.length&&a>0?"date":"string"}function xr(e,t){const r=[];for(const n of e){const a=n.name.toLowerCase();if(!((a.endsWith("id")||a.endsWith("_id")||a==="id")&&n.type==="number"))continue;const i=n.name.replace(/[_-]?id$/i,""),c=[`${i}Name`,`${i}_name`,`${i}name`,`${i.toLowerCase()}name`,`${i}`];for(const l of c){const o=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(o){const h=n.unique_count/t,f=o.unique_count/t;let g=.5;Math.abs(h-f)<.2?g=.9:Math.abs(h-f)<.4&&(g=.7),r.push({id_column:n.name,name_column:o.name,confidence:g});break}}}return r.filter(n=>n.confidence>=.5)}function wr(e,t){if(t.length===0)return e;const r=new Map;for(const n of t){const a=new Map;for(const s of e){const i=s[n.id_column],c=s[n.name_column];i!=null&&c&&a.set(i,c)}r.set(n.id_column,a)}return e.map(n=>{const a={...n};for(const s of t){const i=a[s.id_column],c=r.get(s.id_column);c&&c.has(i)&&(a[`${s.id_column}_original`]=i,a[s.id_column]=c.get(i))}return a})}const bn=new Pe;bn.post("/",async e=>{try{const r=(await e.req.formData()).get("file");if(!r)return e.json({error:"No file provided"},400);const n=r.name,a=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!a)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(r.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const s=await r.text();let i;if(a==="csv")i=br(s);else try{const _=JSON.parse(s);i=Array.isArray(_)?_:[_]}catch{return e.json({error:"Invalid JSON format"},400)}if(i.length===0)return e.json({error:"File contains no data"},400);if(i.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=vr(i),l=Object.keys(i[0]).map(_=>({name:_,type:c[_]||"string",nullable:i.some(x=>x[_]===null||x[_]===void 0||x[_]===""),unique_count:new Set(i.map(x=>x[_])).size,sample_values:i.slice(0,3).map(x=>x[_])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,a,i.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id,f=i.map((_,x)=>e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,x,JSON.stringify(_),0)),g=100;for(let _=0;_<f.length;_+=g){const x=f.slice(_,_+g);await e.env.DB.batch(x)}console.log("Detecting column mappings...");const y=xr(l,i.length);console.log(`Detected ${y.length} column mappings`);for(const _ of y)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,_.id_column,_.name_column).run(),console.log(`  Mapped: ${_.id_column} -> ${_.name_column} (confidence: ${_.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:i.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Pe;nt.get("/",async e=>{try{const r=(await e.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all()).results.map(n=>({...n,columns:JSON.parse(n.columns)}));return e.json({datasets:r})}catch{return e.json({error:"Failed to fetch datasets"},500)}});nt.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const a=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(t).all()).results.map(s=>JSON.parse(s.data));return e.json({dataset:{...r,columns:JSON.parse(r.columns)},sample:a})}catch{return e.json({error:"Failed to fetch dataset"},500)}});nt.get("/:id/analyses",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(t).all()).results.map(a=>({...a,result:JSON.parse(a.result)}));return e.json({analyses:n})}catch{return e.json({error:"Failed to fetch analyses"},500)}});nt.get("/:id/visualizations",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(t).all()).results.map(a=>({...a,config:JSON.parse(a.config)}));return e.json({visualizations:n})}catch{return e.json({error:"Failed to fetch visualizations"},500)}});nt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function Er(e,t){const r=e.filter(s=>s!=null&&s!==""),n=e.length-r.length,a=new Set(r).size;if(t==="number"){const s=r.map(i=>Number(i)).filter(i=>!isNaN(i));return{count:e.length,mean:Me(s),median:Rr(s),mode:zt(s),stdDev:Sr(s),min:Math.min(...s),max:Math.max(...s),q1:ut(s,25),q2:ut(s,50),q3:ut(s,75),nullCount:n,uniqueCount:a}}return{count:e.length,mode:zt(r),min:r[0],max:r[r.length-1],nullCount:n,uniqueCount:a}}function Me(e){return e.length===0?0:e.reduce((t,r)=>t+r,0)/e.length}function Rr(e){if(e.length===0)return 0;const t=[...e].sort((n,a)=>n-a),r=Math.floor(t.length/2);return t.length%2===0?(t[r-1]+t[r])/2:t[r]}function zt(e){if(e.length===0)return null;const t={};let r=0,n=null;for(const a of e){const s=String(a);t[s]=(t[s]||0)+1,t[s]>r&&(r=t[s],n=a)}return n}function Sr(e){if(e.length===0)return 0;const t=Me(e),r=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Me(r))}function ut(e,t){if(e.length===0)return 0;const r=[...e].sort((c,l)=>c-l),n=t/100*(r.length-1),a=Math.floor(n),s=Math.ceil(n),i=n%1;return a===s?r[a]:r[a]*(1-i)+r[s]*i}function Cr(e){if(e.length<4)return{indices:[],threshold:0};const t=ut(e,25),r=ut(e,75),n=r-t,a=t-1.5*n,s=r+1.5*n,i=[];return e.forEach((c,l)=>{(c<a||c>s)&&i.push(l)}),{indices:i,threshold:n}}function Or(e,t){if(e.length!==t.length||e.length===0)return 0;const r=e.length,n=Me(e),a=Me(t);let s=0,i=0,c=0;for(let l=0;l<r;l++){const o=e[l]-n,h=t[l]-a;s+=o*h,i+=o*o,c+=h*h}return i===0||c===0?0:s/Math.sqrt(i*c)}function kr(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,r=Array.from({length:t},(o,h)=>h),n=Me(r),a=Me(e);let s=0,i=0;for(let o=0;o<t;o++)s+=(r[o]-n)*(e[o]-a),i+=Math.pow(r[o]-n,2);const c=i===0?0:s/i,l=Math.min(Math.abs(c)/(Me(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function it(e,t,r,n){var i;let a=50;const s=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(a-=30,s.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(a-=25,s.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(a-=30,s.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(a-=20,s.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(a-=40,s.push("All values are identical")):n.uniqueCount===n.count?(a-=35,s.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(a-=25,s.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(a+=20,s.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(a+=15,s.push("High variability in data"));break;case"correlation":const c=Math.abs(r.correlation||0);c>.8?(a+=30,s.push("Very strong correlation")):c>.6?(a+=20,s.push("Strong correlation")):c>.5&&(a+=10,s.push("Moderate correlation"));break;case"outlier":const o=(r.count||0)/(n.count||1);o>.05&&o<.2?(a+=25,s.push("Significant outliers detected")):o>0&&(a+=10,s.push("Some outliers present"));break;case"pattern":const h=(i=r.topPatterns)==null?void 0:i[0];if(h){const[,g]=h,y=g/n.count;y>.3&&y<.9&&(a+=20,s.push("Clear dominant pattern"))}break;case"trend":const f=r.strength||0;f>.5?(a+=30,s.push("Strong trend detected")):f>.3&&(a+=15,s.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(a-=30,s.push("More than 50% missing data")):c>.2&&(a-=15,s.push("Significant missing data"))}return a=Math.max(0,Math.min(100,a)),{score:a,reasons:s}}async function Tr(e,t,r,n){console.log(`Starting analysis for dataset ${e}`);for(const s of r){const i=t.map(f=>f[s.name]),c=Er(i,s.type),l=Ar(s.name,s.type,c),o=Nr(c,s.type),h=it("statistics",s.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",s.name,JSON.stringify(c),1,l,o,h.score).run(),s.type==="number"){const f=i.map(y=>Number(y)).filter(y=>!isNaN(y)),g=Cr(f);if(g.indices.length>0){const y=`Found ${g.indices.length} unusual values in "${s.name}" (${(g.indices.length/f.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,_={count:g.indices.length,indices:g.indices.slice(0,10)},x=it("outlier",s.name,_,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",s.name,JSON.stringify(_),.85,y,g.indices.length>f.length*.05?"high":"medium",x.score).run()}if(f.length>5){const y=kr(f);if(y.direction!=="stable"){const _=`"${s.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,x=it("trend",s.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",s.name,JSON.stringify(y),y.strength,_,y.strength>.5?"high":"medium",x.score).run()}}}}const a=r.filter(s=>s.type==="number");for(let s=0;s<a.length;s++)for(let i=s+1;i<a.length;i++){const c=a[s],l=a[i],o=t.map(f=>Number(f[c.name])).filter(f=>!isNaN(f)),h=t.map(f=>Number(f[l.name])).filter(f=>!isNaN(f));if(o.length>5&&h.length>5){const f=Or(o,h);if(Math.abs(f)>.5){const g=jr(c.name,l.name,f),y={column1:c.name,column2:l.name,correlation:f},_=it("correlation",void 0,y,{count:o.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(f),g,Math.abs(f)>.7?"high":"medium",_.score).run()}}}for(const s of r)if(s.type==="string"){const i=t.map(h=>h[s.name]).filter(h=>h),c={};i.forEach(h=>{c[h]=(c[h]||0)+1});const o=Object.entries(c).sort((h,f)=>f[1]-h[1]).slice(0,5);if(o.length>0&&o[0][1]>i.length*.1){const h=`The most common value in "${s.name}" is "${o[0][0]}" appearing ${o[0][1]} times (${(o[0][1]/i.length*100).toFixed(1)}% of records).`,f={topPatterns:o},g={count:i.length,uniqueCount:new Set(i).size},y=it("pattern",s.name,f,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",s.name,JSON.stringify(f),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Ar(e,t,r){var n,a,s,i;return t==="number"?`"${e}" ranges from ${(n=r.min)==null?void 0:n.toFixed(2)} to ${(a=r.max)==null?void 0:a.toFixed(2)} with an average of ${(s=r.mean)==null?void 0:s.toFixed(2)}. About half the values are below ${(i=r.median)==null?void 0:i.toFixed(2)}.`:`"${e}" contains ${r.count} values with ${r.uniqueCount} unique entries. Most common: "${r.mode}".`}function jr(e,t,r){const n=Math.abs(r)>.7?"strong":"moderate";return r>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${r.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${r.toFixed(2)}).`}function Nr(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function Dr(e,t,r,n){console.log(`Generating visualizations for dataset ${e}`);const a=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),s=new Map;a.results.forEach(l=>{s.set(l.id_column,l.name_column)});let i=0;const c=[...r].sort((l,o)=>(o.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const o=await $r(l,t,s);o&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,o.chartType,o.title,JSON.stringify(o.config),o.explanation,i++).run()}console.log(`Generated ${i} visualizations`)}function $r(e,t,r){switch(e.analysis_type){case"statistics":return Ir(e,t,r);case"correlation":return Mr(e,t,r);case"outlier":return Pr(e,t,r);case"pattern":return qr(e,t,r);case"trend":return Lr(e,t,r);default:return null}}function Ir(e,t,r){const n=e.column_name;if(!n)return null;const a=e.result,s=r.has(n)?` (via ${r.get(n)})`:"";if(a.mean!==void 0){const o=t.map(f=>Number(f[n])).filter(f=>!isNaN(f)),h=Fr(o);return{chartType:"bar",title:`Distribution: ${n}${s}`,explanation:`This histogram shows how values in "${n}" are distributed${s?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const i=t.map(o=>o[n]).filter(o=>o!=null),c={};i.forEach(o=>{c[String(o)]=(c[String(o)]||0)+1});const l=Object.entries(c).sort((o,h)=>h[1]-o[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${s}`,explanation:`This chart shows the most common values in "${n}"${s?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([o])=>o),datasets:[{label:"Count",data:l.map(([,o])=>o),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function Mr(e,t,r){const n=e.result,a=n.column1,s=n.column2;if(!a||!s)return null;const i=r.has(a)?` (via ${r.get(a)})`:"",c=r.has(s)?` (via ${r.get(s)})`:"",l=t.map(f=>({x:Number(f[a]),y:Number(f[s])})).filter(f=>!isNaN(f.x)&&!isNaN(f.y)),o=n.correlation,h=o>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${a}${i} vs ${s}${c}`,explanation:`Each dot represents one record${i||c?" using human-readable names":""}. ${o>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${a} vs ${s}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${o.toFixed(2)}`}},scales:{x:{title:{display:!0,text:a}},y:{title:{display:!0,text:s}}}}}}}function Pr(e,t,r){const n=e.column_name;if(!n)return null;const a=r.has(n)?` (via ${r.get(n)})`:"",s=new Set(e.result.indices||[]),i=t.map((o,h)=>({x:h,y:Number(o[n]),isOutlier:s.has(h)})).filter(o=>!isNaN(o.y)),c=i.filter(o=>!o.isOutlier),l=i.filter(o=>o.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${a}`,explanation:`Red dots are unusual values that stand out from the pattern${a?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function qr(e,t,r){const n=e.column_name;if(!n)return null;const a=r.has(n)?` (via ${r.get(n)})`:"",s=e.result.topPatterns||[];if(s.length===0)return null;const i=s.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${a}`,explanation:`Each slice shows what percentage of records have that value${a?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:i.map(([c])=>c),datasets:[{data:i.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Lr(e,t,r){const n=e.column_name;if(!n)return null;const a=r.has(n)?` (via ${r.get(n)})`:"",s=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),i=e.result,c=i.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${a}`,explanation:`This line shows how "${n}" changes over time${a?" using human-readable names":""}. ${i.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:s.map((l,o)=>`#${o+1}`),datasets:[{label:n,data:s,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${i.direction==="up"?"↗":"↘"} ${Math.round(i.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function Fr(e,t=10){if(e.length===0)return{labels:[],data:[]};const r=Math.min(...e),s=(Math.max(...e)-r)/t,i=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const o=r+l*s,h=r+(l+1)*s;c.push(`${o.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let o=Math.floor((l-r)/s);o>=t&&(o=t-1),o<0&&(o=0),i[o]++}),{labels:c,data:i}}const vn=new Pe;vn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);let a=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(o=>JSON.parse(o.data));const s=JSON.parse(r.columns),i=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(i.results.length>0){const o=i.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${o.length} column mappings for human-readable analysis...`),a=wr(a,o);for(const h of o){const f=s.find(g=>g.name===h.id_column);f&&(f.enriched_by=h.name_column)}}await Tr(t,a,s,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(o=>({...o,result:JSON.parse(o.result)}));return await Dr(t,a,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const _n=new Pe;_n.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const n=JSON.parse(r.columns),s=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),i=[],c=[],l=new Map;for(const g of n){const y=`col_${g.name}`;if(!l.has(y)){const x=10+g.unique_count/r.row_count*30;i.push({id:y,label:g.name,type:"column",size:x}),l.set(y,!0)}}const o=s.filter(g=>g.analysis_type==="correlation"),h=o.sort((g,y)=>Math.abs(y.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,o.length));for(const g of h){const{column1:y,column2:_,correlation:x}=g.result,D=`col_${y}`,L=`col_${_}`;n.length>50&&Math.abs(x)<.7||c.push({source:D,target:L,type:"correlation",strength:Math.abs(x),label:`${x>0?"+":""}${x.toFixed(2)}`})}const f=s.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of f){const y=g.column_name;if(!y)continue;const{topPatterns:_}=g.result;if(!_||_.length===0)continue;const x=_.slice(0,3);for(const[D,L]of x){const re=`val_${y}_${D}`;l.has(re)||(i.push({id:re,label:String(D),type:"value",size:5+L/r.row_count*20}),l.set(re,!0)),c.push({source:`col_${y}`,target:re,type:"contains",strength:L/r.row_count,label:`${L}x`})}}return e.json({nodes:i,edges:c,dataset_name:r.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const St=new Pe;St.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),r=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:r.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});St.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});St.post("/",async e=>{try{const{dataset_id:t,id_column:r,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,r,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const xn=new Pe,Hr=[{type:"function",function:{name:"get_outlier_columns",description:"Get a list of all columns that have outliers detected, with counts and percentages",parameters:{type:"object",properties:{min_outlier_count:{type:"number",description:"Minimum number of outliers to include (optional, default: 1)"}}}}},{type:"function",function:{name:"get_correlation_analysis",description:"Get correlation analysis between columns, optionally filtered by minimum correlation strength",parameters:{type:"object",properties:{min_correlation:{type:"number",description:"Minimum absolute correlation value to include (0-1, optional, default: 0.5)"},column_name:{type:"string",description:"Specific column to get correlations for (optional)"}}}}},{type:"function",function:{name:"get_column_statistics",description:"Get detailed statistics for a specific column including mean, median, mode, outliers, etc.",parameters:{type:"object",properties:{column_name:{type:"string",description:"Name of the column to analyze"}},required:["column_name"]}}},{type:"function",function:{name:"search_analyses",description:"Search all analyses by type or keyword",parameters:{type:"object",properties:{analysis_type:{type:"string",description:"Type of analysis to filter (outlier, correlation, pattern, summary, etc.)",enum:["outlier","correlation","pattern","summary","missing","distribution"]},keyword:{type:"string",description:"Keyword to search in explanations (optional)"}}}}}];async function zr(e,t,r){const n=r.min_outlier_count||1,s=(await e.prepare(`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'outlier'
    ORDER BY quality_score DESC
  `).bind(t).all()).results.map(i=>{const c=JSON.parse(i.result);return{column:i.column_name,count:c.count||0,percentage:c.percentage||0,explanation:i.explanation,quality_score:i.quality_score}}).filter(i=>i.count>=n);return{total_columns_with_outliers:s.length,outliers:s}}async function Br(e,t,r){const n=r.min_correlation||.5,a=r.column_name;let s=`
    SELECT column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND analysis_type = 'correlation'
  `;a&&(s+=` AND column_name LIKE '%${a}%'`),s+=" ORDER BY quality_score DESC";const c=(await e.prepare(s).bind(t).all()).results.map(l=>{const o=JSON.parse(l.result);return{column:l.column_name,correlation:o.correlation||0,target_column:o.target_column||"unknown",explanation:l.explanation,quality_score:l.quality_score}}).filter(l=>Math.abs(l.correlation)>=n);return{total_correlations:c.length,correlations:c}}async function Ur(e,t,r){const n=r.column_name,a=await e.prepare(`
    SELECT analysis_type, column_name, result, explanation, importance, confidence, quality_score
    FROM analyses 
    WHERE dataset_id = ? AND column_name = ?
    ORDER BY quality_score DESC
  `).bind(t,n).all();if(a.results.length===0)return{error:`No analysis found for column: ${n}`};const s={column:n,analyses:[]};return a.results.forEach(i=>{s.analyses.push({type:i.analysis_type,result:JSON.parse(i.result),explanation:i.explanation,importance:i.importance,confidence:i.confidence,quality_score:i.quality_score})}),s}async function Wr(e,t,r){const n=r.analysis_type,a=r.keyword;let s=`
    SELECT analysis_type, column_name, result, explanation, quality_score
    FROM analyses 
    WHERE dataset_id = ?
  `;const i=[t];n&&(s+=" AND analysis_type = ?",i.push(n)),a&&(s+=" AND explanation LIKE ?",i.push(`%${a}%`)),s+=" ORDER BY quality_score DESC LIMIT 50";const c=await e.prepare(s).bind(...i).all();return{total_found:c.results.length,analyses:c.results.map(l=>({type:l.analysis_type,column:l.column_name,result:JSON.parse(l.result),explanation:l.explanation,quality_score:l.quality_score}))}}xn.post("/:datasetId",async e=>{var t;try{const r=e.req.param("datasetId"),{message:n,conversationHistory:a=[]}=await e.req.json(),s=e.env.OPENAI_API_KEY;if(!s||s.includes("your-openai-api-key"))return e.json({error:"OpenAI API key not configured",message:ot(n)},500);const i=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(r).first();if(!i)return e.json({error:"Dataset not found"},404);const c=JSON.parse(i.columns),o=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${i.name}
Rows: ${i.row_count}
Columns: ${i.column_count}

Available columns: ${c.slice(0,50).map(x=>x.name).join(", ")}${c.length>50?`, ... and ${c.length-50} more`:""}

You have access to tools to query specific analyses:
- get_outlier_columns: Find columns with outliers
- get_correlation_analysis: Find correlations between columns
- get_column_statistics: Get detailed stats for a specific column
- search_analyses: Search all analyses by type or keyword

Your role:
- Use tools to get specific data when asked
- Provide concrete answers with actual numbers from the tools
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists
- Always cite specific results from tool calls

When users ask questions like "which columns have outliers?", use the get_outlier_columns tool to get the actual data.`},...a,{role:"user",content:n}],h=e.env.OPENAI_MODEL||"gpt-4o-mini";console.log(`Calling OpenAI API with model: ${h} and tools`);let f="",g=[],y=[...o];for(let x=0;x<5;x++){const D=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({model:h,messages:y,tools:Hr,tool_choice:"auto",max_tokens:1e3,temperature:.7})}),L=await D.text();if(!D.ok)return console.error("OpenAI API error status:",D.status),console.error("OpenAI API error response:",L),e.json({error:"Failed to get response from OpenAI",message:ot(n)},500);const re=JSON.parse(L),pe=(t=re.choices)==null?void 0:t[0];if(!pe)return console.error("No choice in OpenAI response:",re),e.json({error:"Empty response from OpenAI",message:ot(n)},500);const J=pe.message;if(J.tool_calls&&J.tool_calls.length>0){console.log(`Tool calls requested: ${J.tool_calls.length}`),y.push(J);for(const fe of J.tool_calls){const ee=fe.function.name,T=JSON.parse(fe.function.arguments);console.log(`Executing tool: ${ee}`,T);let u;try{switch(ee){case"get_outlier_columns":u=await zr(e.env.DB,r,T);break;case"get_correlation_analysis":u=await Br(e.env.DB,r,T);break;case"get_column_statistics":u=await Ur(e.env.DB,r,T);break;case"search_analyses":u=await Wr(e.env.DB,r,T);break;default:u={error:`Unknown function: ${ee}`}}}catch(d){console.error(`Tool execution error for ${ee}:`,d),u={error:`Failed to execute ${ee}: ${d}`}}y.push({role:"tool",tool_call_id:fe.id,content:JSON.stringify(u)})}continue}f=J.content||"";break}if(!f)return e.json({error:"No final response from OpenAI",message:ot(n)},500);const _=Jr(n,[]);return e.json({message:f,suggestions:_})}catch(r){console.error("Chat error:",r);const n=r instanceof Error?r.message:String(r);return e.json({error:"Chat failed: "+n,message:ot("error")},500)}});function Jr(e,t){const r=e.toLowerCase(),n=[];return r.includes("outlier")?(n.push("Show me correlations between outlier columns"),n.push("What patterns exist in the outliers?")):r.includes("correlat")?(n.push("Which columns have the most outliers?"),n.push("Are there patterns in categorical data?")):(n.push("Which columns have outliers?"),n.push("Show me the strongest correlations"),n.push("What are the key patterns?")),n.slice(0,3)}function ot(e){const t=e.toLowerCase();return t.includes("outlier")?"To see outliers, go to the 'Insights' tab and search for 'outlier'.":t.includes("correlat")?"Check the 'Insights' tab and search for 'correlation'.":"I'm currently operating in fallback mode. Please configure your OpenAI API key."}const ve=new Pe;ve.use("/api/*",nr());ve.use("/static/*",hr({root:"./public"}));ve.route("/api/upload",bn);ve.route("/api/datasets",nt);ve.route("/api/analyze",vn);ve.route("/api/relationships",_n);ve.route("/api/mappings",St);ve.route("/api/chat",xn);ve.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));ve.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Intelligence Platform</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
        <script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"><\/script>
        <style>
          :root {
            --bg-primary: #e0e5ec;
            --bg-secondary: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #6b7280;
            --accent: #3b82f6;
            --shadow-light: #ffffff;
            --shadow-dark: #a3b1c6;
          }

          [data-theme="dark"] {
            --bg-primary: #1e293b;
            --bg-secondary: #0f172a;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --accent: #60a5fa;
            --shadow-light: #2d3e54;
            --shadow-dark: #0a1120;
          }

          * {
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
          }

          body {
            background: var(--bg-primary);
            color: var(--text-primary);
          }

          /* Neumorphism Styles */
          .neu-card {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: 8px 8px 16px var(--shadow-dark),
                        -8px -8px 16px var(--shadow-light);
          }

          .neu-card-inset {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: inset 8px 8px 16px var(--shadow-dark),
                        inset -8px -8px 16px var(--shadow-light);
          }

          .neu-button {
            background: var(--bg-primary);
            border-radius: 12px;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
          }

          .neu-button:hover {
            box-shadow: 2px 2px 4px var(--shadow-dark),
                        -2px -2px 4px var(--shadow-light);
          }

          .neu-button:active {
            box-shadow: inset 4px 4px 8px var(--shadow-dark),
                        inset -4px -4px 8px var(--shadow-light);
          }

          .neu-button-accent {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .upload-area {
            border: 2px dashed var(--text-secondary);
            transition: all 0.3s;
          }

          .upload-area.drag-over {
            border-color: var(--accent);
            background-color: var(--bg-secondary);
          }

          .insight-card {
            animation: slideIn 0.5s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Tab Styles */
          .tab-btn {
            background: var(--bg-primary);
            border-radius: 12px;
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
          }

          .tab-btn.active {
            background: linear-gradient(145deg, var(--accent), #2563eb);
            color: white;
            box-shadow: inset 4px 4px 8px rgba(0,0,0,0.2),
                        inset -4px -4px 8px rgba(255,255,255,0.1);
          }

          /* Dark mode toggle */
          .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }

          /* Print styles */
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .neu-card { box-shadow: none; border: 1px solid #e5e7eb; }
          }
        </style>
    </head>
    <body>
        <!-- Theme Toggle -->
        <button onclick="toggleTheme()" class="theme-toggle neu-button">
            <i id="theme-icon" class="fas fa-moon"></i>
        </button>

        <div class="min-h-screen p-8">
            <!-- Header -->
            <header class="neu-card p-6 mb-8 no-print">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">
                            <i class="fas fa-brain mr-3" style="color: var(--accent);"></i>
                            Data Intelligence Platform
                        </h1>
                        <p class="text-sm mt-2" style="color: var(--text-secondary);">
                            Upload → Analyze → Understand. Automated insights from your data.
                        </p>
                    </div>
                    <button id="view-datasets" class="neu-button">
                        <i class="fas fa-database mr-2"></i>My Datasets
                    </button>
                </div>
            </header>

            <!-- Main Content -->
            <main>
                <!-- Upload Section -->
                <div id="upload-section" class="mb-8">
                    <div class="neu-card p-8">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-upload mr-2" style="color: var(--accent);"></i>
                            Upload Your Data
                        </h2>
                        <p class="mb-6" style="color: var(--text-secondary);">
                            Drop a CSV or JSON file below and we'll automatically analyze it, find patterns, 
                            and explain what matters in plain English.
                        </p>

                        <div id="upload-area" class="upload-area neu-card-inset rounded-lg p-12 text-center cursor-pointer">
                            <input type="file" id="file-input" accept=".csv,.json" class="hidden">
                            <div id="upload-prompt">
                                <i class="fas fa-cloud-upload-alt text-6xl mb-4" style="color: var(--text-secondary);"></i>
                                <p class="text-xl mb-2">Drop your file here or click to browse</p>
                                <p class="text-sm" style="color: var(--text-secondary);">Supports CSV and JSON files</p>
                            </div>
                            <div id="upload-progress" class="hidden">
                                <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color: var(--accent);"></i>
                                <p id="status-message" class="text-lg font-semibold">Uploading...</p>
                                <p id="status-detail" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                                <div class="mt-4 w-64 mx-auto neu-card-inset rounded-full h-3">
                                    <div id="progress-bar" class="h-3 rounded-full transition-all duration-300" 
                                         style="width: 0%; background: linear-gradient(90deg, var(--accent), #2563eb);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="results-section" class="hidden">
                    <!-- Export Actions -->
                    <div class="mb-6 flex justify-between items-center no-print">
                        <div class="flex gap-3">
                            <button id="tab-insights" onclick="switchTab('insights')" class="tab-btn active">
                                <i class="fas fa-lightbulb mr-2"></i>Insights
                            </button>
                            <button id="tab-relationships" onclick="switchTab('relationships')" class="tab-btn">
                                <i class="fas fa-project-diagram mr-2"></i>Relationships
                            </button>
                            <button id="tab-mappings" onclick="switchTab('mappings')" class="tab-btn">
                                <i class="fas fa-link mr-2"></i>Column Mappings
                            </button>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="window.print()" class="neu-button-accent">
                                <i class="fas fa-file-pdf mr-2"></i>Export PDF
                            </button>
                            <button onclick="showSection('upload')" class="neu-button">
                                <i class="fas fa-plus mr-2"></i>New Analysis
                            </button>
                        </div>
                    </div>

                    <!-- Dataset Info -->
                    <div class="neu-card p-6 mb-6">
                        <h2 class="text-2xl font-bold mb-4">
                            <i class="fas fa-info-circle mr-2" style="color: var(--accent);"></i>
                            Dataset Overview
                        </h2>
                        <div id="dataset-info" class="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
                    </div>

                    <!-- Insights Tab -->
                    <div id="tab-content-insights">
                        <!-- Search and Filter Bar -->
                        <div class="neu-card p-4 mb-6 no-print">
                            <div class="flex gap-3 items-center">
                                <div class="flex-1 neu-card-inset rounded-lg p-2 flex items-center">
                                    <i class="fas fa-search mx-3" style="color: var(--text-secondary);"></i>
                                    <input type="text" id="insight-search" 
                                           placeholder="Search insights, columns, patterns..." 
                                           onkeyup="debouncedSearch(this.value)"
                                           class="flex-1 bg-transparent border-none outline-none"
                                           style="color: var(--text-primary);">
                                </div>
                                <button onclick="showBookmarked()" class="neu-button" title="Show Bookmarked">
                                    <i class="fas fa-star mr-2" style="color: #f59e0b;"></i>Bookmarked
                                </button>
                                <button onclick="filterInsights('')" class="neu-button" title="Clear Filters">
                                    <i class="fas fa-redo mr-2"></i>Reset
                                </button>
                            </div>
                            <p id="search-result-count" class="text-sm mt-2" style="color: var(--text-secondary);"></p>
                        </div>

                        <!-- Visualizations -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-chart-line mr-2" style="color: #a855f7;"></i>
                                Visual Insights
                            </h2>
                            <div id="visualizations-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                        </div>

                        <!-- Key Insights -->
                        <div class="neu-card p-6 mb-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-lightbulb mr-2" style="color: #f59e0b;"></i>
                                Key Insights
                            </h2>
                            <div id="insights-container" class="space-y-4"></div>
                        </div>

                        <!-- Sample Data -->
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-table mr-2" style="color: #10b981;"></i>
                                Sample Data
                            </h2>
                            <div id="sample-data" class="overflow-x-auto"></div>
                        </div>
                    </div>

                    <!-- Relationships Tab -->
                    <div id="tab-content-relationships" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-project-diagram mr-2" style="color: #a855f7;"></i>
                                Interactive Relationship Graph
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                This graph shows how columns relate to each other. Click and drag to explore. 
                                Thicker lines mean stronger relationships.
                            </p>
                            <div id="graph-container" class="neu-card-inset rounded-lg p-4" style="height: 600px;"></div>
                        </div>
                    </div>

                    <!-- Mappings Tab -->
                    <div id="tab-content-mappings" class="hidden">
                        <div class="neu-card p-6">
                            <h2 class="text-2xl font-bold mb-4">
                                <i class="fas fa-link mr-2" style="color: #3b82f6;"></i>
                                Column Mappings
                            </h2>
                            <p class="mb-4" style="color: var(--text-secondary);">
                                These mappings tell the system how to replace ID columns with human-readable names in visualizations.
                                Auto-detected mappings are marked with a green badge.
                            </p>
                            <div id="mappings-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Datasets List -->
                <div id="datasets-section" class="hidden">
                    <div class="neu-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">
                                <i class="fas fa-database mr-2" style="color: var(--accent);"></i>
                                Your Datasets
                            </h2>
                            <button id="back-to-upload" class="neu-button-accent">
                                <i class="fas fa-plus mr-2"></i>New Upload
                            </button>
                        </div>
                        <div id="datasets-list"></div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Chat Widget -->
        <div id="chat-widget" class="hidden fixed bottom-20 right-8 w-96 h-[32rem] neu-card flex flex-col no-print" style="z-index: 1000;">
            <div class="p-4 border-b flex items-center justify-between" style="border-color: var(--shadow-dark);">
                <div class="flex items-center gap-2">
                    <i class="fas fa-brain" style="color: var(--accent);"></i>
                    <h3 class="font-semibold" style="color: var(--text-primary);">Data Assistant</h3>
                </div>
                <button onclick="clearChat()" class="neu-button p-2" title="Clear Chat">
                    <i class="fas fa-redo text-sm"></i>
                </button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4" style="background: var(--bg-primary);">
                <div class="flex items-start gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                        <i class="fas fa-brain text-sm"></i>
                    </div>
                    <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                        <p class="mb-3">👋 Hi! I'm your data analysis assistant. I can help you understand patterns, correlations, and insights in your data.</p>
                        <p class="text-sm" style="color: var(--text-secondary);">💡 <strong>Tip:</strong> To enable AI-powered responses, add your OpenAI API key to <code>.dev.vars</code> file. See <a href="https://github.com/yourusername/webapp/blob/main/OPENAI_SETUP.md" target="_blank" class="underline" style="color: var(--accent);">OPENAI_SETUP.md</a> for instructions.</p>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t flex gap-2" style="border-color: var(--shadow-dark);">
                <input type="text" id="chat-input" 
                       placeholder="Ask about your data..." 
                       class="flex-1 neu-card-inset rounded-lg px-4 py-2 bg-transparent border-none outline-none"
                       style="color: var(--text-primary);">
                <button onclick="sendChatMessage()" class="neu-button-accent px-4 py-2">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <!-- Chat Toggle Button -->
        <button id="chat-toggle-btn" onclick="toggleChat()" 
                class="fixed bottom-8 right-8 w-14 h-14 neu-button-accent rounded-full flex items-center justify-center no-print"
                style="z-index: 999;">
            <i class="fas fa-comments text-xl"></i>
        </button>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          // Theme management
          function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.getElementById('theme-icon');
            icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          }

          // Load saved theme
          window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = document.getElementById('theme-icon');
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
          });
        <\/script>
        <script src="/static/app.js"><\/script>
        <script src="/static/graph.js"><\/script>
        <script src="/static/chat.js"><\/script>
    </body>
    </html>
  `));const Bt=new Pe,Vr=Object.assign({"/src/index.tsx":ve});let wn=!1;for(const[,e]of Object.entries(Vr))e&&(Bt.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),Bt.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),wn=!0);if(!wn)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Bt as default};
