var _n=Object.defineProperty;var Nt=e=>{throw TypeError(e)};var En=(e,t,r)=>t in e?_n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var _=(e,t,r)=>En(e,typeof t!="symbol"?t+"":t,r),Ct=(e,t,r)=>t.has(e)||Nt("Cannot "+r);var f=(e,t,r)=>(Ct(e,t,"read from private field"),r?r.call(e):t.get(e)),T=(e,t,r)=>t.has(e)?Nt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),w=(e,t,r,n)=>(Ct(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),L=(e,t,r)=>(Ct(e,t,"access private method"),r);var It=(e,t,r,n)=>({set _(s){w(e,t,s,r)},get _(){return f(e,t,n)}});var Mt=(e,t,r)=>(n,s)=>{let i=-1;return a(0);async function a(c){if(c<=i)throw new Error("next() called multiple times");i=c;let l,o=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&s||void 0,h)try{l=await h(n,()=>a(c+1))}catch(p){if(p instanceof Error&&t)n.error=p,l=await t(p,n),o=!0;else throw p}else n.finalized===!1&&r&&(l=await r(n));return l&&(n.finalized===!1||o)&&(n.res=l),n}},Rn=Symbol(),Sn=async(e,t=Object.create(null))=>{const{all:r=!1,dot:n=!1}=t,i=(e instanceof rn?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?Cn(e,{all:r,dot:n}):{}};async function Cn(e,t){const r=await e.formData();return r?On(r,t):{}}function On(e,t){const r=Object.create(null);return e.forEach((n,s)=>{t.all||s.endsWith("[]")?Tn(r,s,n):r[s]=n}),t.dot&&Object.entries(r).forEach(([n,s])=>{n.includes(".")&&(kn(r,n,s),delete r[n])}),r}var Tn=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},kn=(e,t,r)=>{let n=e;const s=t.split(".");s.forEach((i,a)=>{a===s.length-1?n[i]=r:((!n[i]||typeof n[i]!="object"||Array.isArray(n[i])||n[i]instanceof File)&&(n[i]=Object.create(null)),n=n[i])})},Xt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},$n=e=>{const{groups:t,path:r}=jn(e),n=Xt(r);return An(n,t)},jn=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,n)=>{const s=`@${n}`;return t.push([s,r]),s}),{groups:t,path:e}},An=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[n]=t[r];for(let s=e.length-1;s>=0;s--)if(e[s].includes(n)){e[s]=e[s].replace(n,t[r][1]);break}}return e},gt={},Dn=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const n=`${e}#${t}`;return gt[n]||(r[2]?gt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:gt[n]=[e,r[1],!0]),gt[n]}return null},jt=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},Nn=e=>jt(e,decodeURI),Zt=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let n=r;for(;n<t.length;n++){const s=t.charCodeAt(n);if(s===37){const i=t.indexOf("?",n),a=t.slice(r,i===-1?void 0:i);return Nn(a.includes("%25")?a.replace(/%25/g,"%2525"):a)}else if(s===63)break}return t.slice(r,n)},In=e=>{const t=Zt(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...r)=>(r.length&&(t=Ke(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),en=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let n="";return t.forEach(s=>{if(s!==""&&!/\:/.test(s))n+="/"+s;else if(/\:/.test(s))if(/\?/.test(s)){r.length===0&&n===""?r.push("/"):r.push(n);const i=s.replace("?","");n+="/"+i,r.push(n)}else n+="/"+s}),r.filter((s,i,a)=>a.indexOf(s)===i)},Ot=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?jt(e,nn):e):e,tn=(e,t,r)=>{let n;if(!r&&t&&!/[%+]/.test(t)){let a=e.indexOf(`?${t}`,8);for(a===-1&&(a=e.indexOf(`&${t}`,8));a!==-1;){const c=e.charCodeAt(a+t.length+1);if(c===61){const l=a+t.length+2,o=e.indexOf("&",l);return Ot(e.slice(l,o===-1?void 0:o))}else if(c==38||isNaN(c))return"";a=e.indexOf(`&${t}`,a+1)}if(n=/[%+]/.test(e),!n)return}const s={};n??(n=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const a=e.indexOf("&",i+1);let c=e.indexOf("=",i);c>a&&a!==-1&&(c=-1);let l=e.slice(i+1,c===-1?a===-1?void 0:a:c);if(n&&(l=Ot(l)),i=a,l==="")continue;let o;c===-1?o="":(o=e.slice(c+1,a===-1?void 0:a),n&&(o=Ot(o))),r?(s[l]&&Array.isArray(s[l])||(s[l]=[]),s[l].push(o)):s[l]??(s[l]=o)}return t?s[t]:s},Mn=tn,Fn=(e,t)=>tn(e,t,!0),nn=decodeURIComponent,Ft=e=>jt(e,nn),Qe,de,Ce,sn,an,kt,ke,Bt,rn=(Bt=class{constructor(e,t="/",r=[[]]){T(this,Ce);_(this,"raw");T(this,Qe);T(this,de);_(this,"routeIndex",0);_(this,"path");_(this,"bodyCache",{});T(this,ke,e=>{const{bodyCache:t,raw:r}=this,n=t[e];if(n)return n;const s=Object.keys(t)[0];return s?t[s].then(i=>(s==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,w(this,de,r),w(this,Qe,{})}param(e){return e?L(this,Ce,sn).call(this,e):L(this,Ce,an).call(this)}query(e){return Mn(this.url,e)}queries(e){return Fn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,n)=>{t[n]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Sn(this,e))}json(){return f(this,ke).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,ke).call(this,"text")}arrayBuffer(){return f(this,ke).call(this,"arrayBuffer")}blob(){return f(this,ke).call(this,"blob")}formData(){return f(this,ke).call(this,"formData")}addValidatedData(e,t){f(this,Qe)[e]=t}valid(e){return f(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Rn](){return f(this,de)}get matchedRoutes(){return f(this,de)[0].map(([[,e]])=>e)}get routePath(){return f(this,de)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,de=new WeakMap,Ce=new WeakSet,sn=function(e){const t=f(this,de)[0][this.routeIndex][1][e],r=L(this,Ce,kt).call(this,t);return r&&/\%/.test(r)?Ft(r):r},an=function(){const e={},t=Object.keys(f(this,de)[0][this.routeIndex][1]);for(const r of t){const n=L(this,Ce,kt).call(this,f(this,de)[0][this.routeIndex][1][r]);n!==void 0&&(e[r]=/\%/.test(n)?Ft(n):n)}return e},kt=function(e){return f(this,de)[1]?f(this,de)[1][e]:e},ke=new WeakMap,Bt),Ln={Stringify:1},on=async(e,t,r,n,s)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(s?s[0]+=e:s=[e],Promise.all(i.map(c=>c({phase:t,buffer:s,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>on(l,t,!1,n,s))).then(()=>s[0]))):Promise.resolve(e)},qn="text/plain; charset=UTF-8",Tt=(e,t)=>({"Content-Type":e,...t}),ut,dt,_e,Xe,Ee,se,ht,Ze,et,Pe,ft,pt,$e,Ye,Ut,Pn=(Ut=class{constructor(e,t){T(this,$e);T(this,ut);T(this,dt);_(this,"env",{});T(this,_e);_(this,"finalized",!1);_(this,"error");T(this,Xe);T(this,Ee);T(this,se);T(this,ht);T(this,Ze);T(this,et);T(this,Pe);T(this,ft);T(this,pt);_(this,"render",(...e)=>(f(this,Ze)??w(this,Ze,t=>this.html(t)),f(this,Ze).call(this,...e)));_(this,"setLayout",e=>w(this,ht,e));_(this,"getLayout",()=>f(this,ht));_(this,"setRenderer",e=>{w(this,Ze,e)});_(this,"header",(e,t,r)=>{this.finalized&&w(this,se,new Response(f(this,se).body,f(this,se)));const n=f(this,se)?f(this,se).headers:f(this,Pe)??w(this,Pe,new Headers);t===void 0?n.delete(e):r!=null&&r.append?n.append(e,t):n.set(e,t)});_(this,"status",e=>{w(this,Xe,e)});_(this,"set",(e,t)=>{f(this,_e)??w(this,_e,new Map),f(this,_e).set(e,t)});_(this,"get",e=>f(this,_e)?f(this,_e).get(e):void 0);_(this,"newResponse",(...e)=>L(this,$e,Ye).call(this,...e));_(this,"body",(e,t,r)=>L(this,$e,Ye).call(this,e,t,r));_(this,"text",(e,t,r)=>!f(this,Pe)&&!f(this,Xe)&&!t&&!r&&!this.finalized?new Response(e):L(this,$e,Ye).call(this,e,t,Tt(qn,r)));_(this,"json",(e,t,r)=>L(this,$e,Ye).call(this,JSON.stringify(e),t,Tt("application/json",r)));_(this,"html",(e,t,r)=>{const n=s=>L(this,$e,Ye).call(this,s,t,Tt("text/html; charset=UTF-8",r));return typeof e=="object"?on(e,Ln.Stringify,!1,{}).then(n):n(e)});_(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});_(this,"notFound",()=>(f(this,et)??w(this,et,()=>new Response),f(this,et).call(this,this)));w(this,ut,e),t&&(w(this,Ee,t.executionCtx),this.env=t.env,w(this,et,t.notFoundHandler),w(this,pt,t.path),w(this,ft,t.matchResult))}get req(){return f(this,dt)??w(this,dt,new rn(f(this,ut),f(this,pt),f(this,ft))),f(this,dt)}get event(){if(f(this,Ee)&&"respondWith"in f(this,Ee))return f(this,Ee);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,Ee))return f(this,Ee);throw Error("This context has no ExecutionContext")}get res(){return f(this,se)||w(this,se,new Response(null,{headers:f(this,Pe)??w(this,Pe,new Headers)}))}set res(e){if(f(this,se)&&e){e=new Response(e.body,e);for(const[t,r]of f(this,se).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=f(this,se).headers.getSetCookie();e.headers.delete("set-cookie");for(const s of n)e.headers.append("set-cookie",s)}else e.headers.set(t,r)}w(this,se,e),this.finalized=!0}get var(){return f(this,_e)?Object.fromEntries(f(this,_e)):{}}},ut=new WeakMap,dt=new WeakMap,_e=new WeakMap,Xe=new WeakMap,Ee=new WeakMap,se=new WeakMap,ht=new WeakMap,Ze=new WeakMap,et=new WeakMap,Pe=new WeakMap,ft=new WeakMap,pt=new WeakMap,$e=new WeakSet,Ye=function(e,t,r){const n=f(this,se)?new Headers(f(this,se).headers):f(this,Pe)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[a,c]of i)a.toLowerCase()==="set-cookie"?n.append(a,c):n.set(a,c)}if(r)for(const[i,a]of Object.entries(r))if(typeof a=="string")n.set(i,a);else{n.delete(i);for(const c of a)n.append(i,c)}const s=typeof t=="number"?t:(t==null?void 0:t.status)??f(this,Xe);return new Response(e,{status:s,headers:n})},Ut),G="ALL",Hn="all",zn=["get","post","put","delete","options","patch"],ln="Can not add a route since the matcher is already built.",cn=class extends Error{},Bn="__COMPOSED_HANDLER",Un=e=>e.text("404 Not Found",404),Lt=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},pe,Q,dn,me,Le,yt,bt,Wt,un=(Wt=class{constructor(t={}){T(this,Q);_(this,"get");_(this,"post");_(this,"put");_(this,"delete");_(this,"options");_(this,"patch");_(this,"all");_(this,"on");_(this,"use");_(this,"router");_(this,"getPath");_(this,"_basePath","/");T(this,pe,"/");_(this,"routes",[]);T(this,me,Un);_(this,"errorHandler",Lt);_(this,"onError",t=>(this.errorHandler=t,this));_(this,"notFound",t=>(w(this,me,t),this));_(this,"fetch",(t,...r)=>L(this,Q,bt).call(this,t,r[1],r[0],t.method));_(this,"request",(t,r,n,s)=>t instanceof Request?this.fetch(r?new Request(t,r):t,n,s):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,r),n,s)));_(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(L(this,Q,bt).call(this,t.request,t,void 0,t.request.method))})});[...zn,Hn].forEach(i=>{this[i]=(a,...c)=>(typeof a=="string"?w(this,pe,a):L(this,Q,Le).call(this,i,f(this,pe),a),c.forEach(l=>{L(this,Q,Le).call(this,i,f(this,pe),l)}),this)}),this.on=(i,a,...c)=>{for(const l of[a].flat()){w(this,pe,l);for(const o of[i].flat())c.map(h=>{L(this,Q,Le).call(this,o.toUpperCase(),f(this,pe),h)})}return this},this.use=(i,...a)=>(typeof i=="string"?w(this,pe,i):(w(this,pe,"*"),a.unshift(i)),a.forEach(c=>{L(this,Q,Le).call(this,G,f(this,pe),c)}),this);const{strict:n,...s}=t;Object.assign(this,s),this.getPath=n??!0?t.getPath??Zt:In}route(t,r){const n=this.basePath(t);return r.routes.map(s=>{var a;let i;r.errorHandler===Lt?i=s.handler:(i=async(c,l)=>(await Mt([],r.errorHandler)(c,()=>s.handler(c,l))).res,i[Bn]=s.handler),L(a=n,Q,Le).call(a,s.method,s.path,i)}),this}basePath(t){const r=L(this,Q,dn).call(this);return r._basePath=Ke(this._basePath,t),r}mount(t,r,n){let s,i;n&&(typeof n=="function"?i=n:(i=n.optionHandler,n.replaceRequest===!1?s=l=>l:s=n.replaceRequest));const a=i?l=>{const o=i(l);return Array.isArray(o)?o:[o]}:l=>{let o;try{o=l.executionCtx}catch{}return[l.env,o]};s||(s=(()=>{const l=Ke(this._basePath,t),o=l==="/"?0:l.length;return h=>{const p=new URL(h.url);return p.pathname=p.pathname.slice(o)||"/",new Request(p,h)}})());const c=async(l,o)=>{const h=await r(s(l.req.raw),...a(l));if(h)return h;await o()};return L(this,Q,Le).call(this,G,Ke(t,"*"),c),this}},pe=new WeakMap,Q=new WeakSet,dn=function(){const t=new un({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,w(t,me,f(this,me)),t.routes=this.routes,t},me=new WeakMap,Le=function(t,r,n){t=t.toUpperCase(),r=Ke(this._basePath,r);const s={basePath:this._basePath,path:r,method:t,handler:n};this.router.add(t,r,[n,s]),this.routes.push(s)},yt=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},bt=function(t,r,n,s){if(s==="HEAD")return(async()=>new Response(null,await L(this,Q,bt).call(this,t,r,n,"GET")))();const i=this.getPath(t,{env:n}),a=this.router.match(s,i),c=new Pn(t,{path:i,matchResult:a,env:n,executionCtx:r,notFoundHandler:f(this,me)});if(a[0].length===1){let o;try{o=a[0][0][0][0](c,async()=>{c.res=await f(this,me).call(this,c)})}catch(h){return L(this,Q,yt).call(this,h,c)}return o instanceof Promise?o.then(h=>h||(c.finalized?c.res:f(this,me).call(this,c))).catch(h=>L(this,Q,yt).call(this,h,c)):o??f(this,me).call(this,c)}const l=Mt(a[0],this.errorHandler,f(this,me));return(async()=>{try{const o=await l(c);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return L(this,Q,yt).call(this,o,c)}})()},Wt),hn=[];function Wn(e,t){const r=this.buildAllMatchers(),n=(s,i)=>{const a=r[s]||r[G],c=a[2][i];if(c)return c;const l=i.match(a[0]);if(!l)return[[],hn];const o=l.indexOf("",1);return[a[1][o],l]};return this.match=n,n(e,t)}var wt="[^/]+",ot=".*",lt="(?:|/.*)",Ge=Symbol(),Vn=new Set(".\\+*[^]$()");function Jn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===ot||e===lt?1:t===ot||t===lt?-1:e===wt?1:t===wt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,ze,ge,Vt,$t=(Vt=class{constructor(){T(this,He);T(this,ze);T(this,ge,Object.create(null))}insert(t,r,n,s,i){if(t.length===0){if(f(this,He)!==void 0)throw Ge;if(i)return;w(this,He,r);return}const[a,...c]=t,l=a==="*"?c.length===0?["","",ot]:["","",wt]:a==="/*"?["","",lt]:a.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(l){const h=l[1];let p=l[2]||wt;if(h&&l[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw Ge;if(o=f(this,ge)[p],!o){if(Object.keys(f(this,ge)).some(g=>g!==ot&&g!==lt))throw Ge;if(i)return;o=f(this,ge)[p]=new $t,h!==""&&w(o,ze,s.varIndex++)}!i&&h!==""&&n.push([h,f(o,ze)])}else if(o=f(this,ge)[a],!o){if(Object.keys(f(this,ge)).some(h=>h.length>1&&h!==ot&&h!==lt))throw Ge;if(i)return;o=f(this,ge)[a]=new $t}o.insert(c,r,n,s,i)}buildRegExpStr(){const r=Object.keys(f(this,ge)).sort(Jn).map(n=>{const s=f(this,ge)[n];return(typeof f(s,ze)=="number"?`(${n})@${f(s,ze)}`:Vn.has(n)?`\\${n}`:n)+s.buildRegExpStr()});return typeof f(this,He)=="number"&&r.unshift(`#${f(this,He)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},He=new WeakMap,ze=new WeakMap,ge=new WeakMap,Vt),_t,mt,Jt,Kn=(Jt=class{constructor(){T(this,_t,{varIndex:0});T(this,mt,new $t)}insert(e,t,r){const n=[],s=[];for(let a=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const o=`@\\${a}`;return s[a]=[o,l],a++,c=!0,o}),!c)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let a=s.length-1;a>=0;a--){const[c]=s[a];for(let l=i.length-1;l>=0;l--)if(i[l].indexOf(c)!==-1){i[l]=i[l].replace(c,s[a][1]);break}}return f(this,mt).insert(i,t,n,f(this,_t),r),n}buildRegExp(){let e=f(this,mt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(s,i,a)=>i!==void 0?(r[++t]=Number(i),"$()"):(a!==void 0&&(n[Number(a)]=++t),"")),[new RegExp(`^${e}`),r,n]}},_t=new WeakMap,mt=new WeakMap,Jt),Yn=[/^$/,[],Object.create(null)],vt=Object.create(null);function fn(e){return vt[e]??(vt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Gn(){vt=Object.create(null)}function Qn(e){var o;const t=new Kn,r=[];if(e.length===0)return Yn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,p],[g,y])=>h?1:g?-1:p.length-y.length),s=Object.create(null);for(let h=0,p=-1,g=n.length;h<g;h++){const[y,N,O]=n[h];y?s[N]=[O.map(([H])=>[H,Object.create(null)]),hn]:p++;let M;try{M=t.insert(N,p,y)}catch(H){throw H===Ge?new cn(N):H}y||(r[p]=O.map(([H,ae])=>{const Oe=Object.create(null);for(ae-=1;ae>=0;ae--){const[oe,Fe]=M[ae];Oe[oe]=Fe}return[H,Oe]}))}const[i,a,c]=t.buildRegExp();for(let h=0,p=r.length;h<p;h++)for(let g=0,y=r[h].length;g<y;g++){const N=(o=r[h][g])==null?void 0:o[1];if(!N)continue;const O=Object.keys(N);for(let M=0,H=O.length;M<H;M++)N[O[M]]=c[N[O[M]]]}const l=[];for(const h in a)l[h]=r[a[h]];return[i,l,s]}function Je(e,t){if(e){for(const r of Object.keys(e).sort((n,s)=>s.length-n.length))if(fn(r).test(t))return[...e[r]]}}var je,Ae,Et,pn,Kt,Xn=(Kt=class{constructor(){T(this,Et);_(this,"name","RegExpRouter");T(this,je);T(this,Ae);_(this,"match",Wn);w(this,je,{[G]:Object.create(null)}),w(this,Ae,{[G]:Object.create(null)})}add(e,t,r){var c;const n=f(this,je),s=f(this,Ae);if(!n||!s)throw new Error(ln);n[e]||[n,s].forEach(l=>{l[e]=Object.create(null),Object.keys(l[G]).forEach(o=>{l[e][o]=[...l[G][o]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=fn(t);e===G?Object.keys(n).forEach(o=>{var h;(h=n[o])[t]||(h[t]=Je(n[o],t)||Je(n[G],t)||[])}):(c=n[e])[t]||(c[t]=Je(n[e],t)||Je(n[G],t)||[]),Object.keys(n).forEach(o=>{(e===G||e===o)&&Object.keys(n[o]).forEach(h=>{l.test(h)&&n[o][h].push([r,i])})}),Object.keys(s).forEach(o=>{(e===G||e===o)&&Object.keys(s[o]).forEach(h=>l.test(h)&&s[o][h].push([r,i]))});return}const a=en(t)||[t];for(let l=0,o=a.length;l<o;l++){const h=a[l];Object.keys(s).forEach(p=>{var g;(e===G||e===p)&&((g=s[p])[h]||(g[h]=[...Je(n[p],h)||Je(n[G],h)||[]]),s[p][h].push([r,i-o+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(f(this,Ae)).concat(Object.keys(f(this,je))).forEach(t=>{e[t]||(e[t]=L(this,Et,pn).call(this,t))}),w(this,je,w(this,Ae,void 0)),Gn(),e}},je=new WeakMap,Ae=new WeakMap,Et=new WeakSet,pn=function(e){const t=[];let r=e===G;return[f(this,je),f(this,Ae)].forEach(n=>{const s=n[e]?Object.keys(n[e]).map(i=>[i,n[e][i]]):[];s.length!==0?(r||(r=!0),t.push(...s)):e!==G&&t.push(...Object.keys(n[G]).map(i=>[i,n[G][i]]))}),r?Qn(t):null},Kt),De,Re,Yt,Zn=(Yt=class{constructor(e){_(this,"name","SmartRouter");T(this,De,[]);T(this,Re,[]);w(this,De,e.routers)}add(e,t,r){if(!f(this,Re))throw new Error(ln);f(this,Re).push([e,t,r])}match(e,t){if(!f(this,Re))throw new Error("Fatal error");const r=f(this,De),n=f(this,Re),s=r.length;let i=0,a;for(;i<s;i++){const c=r[i];try{for(let l=0,o=n.length;l<o;l++)c.add(...n[l]);a=c.match(e,t)}catch(l){if(l instanceof cn)continue;throw l}this.match=c.match.bind(c),w(this,De,[c]),w(this,Re,void 0);break}if(i===s)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,a}get activeRouter(){if(f(this,Re)||f(this,De).length!==1)throw new Error("No active router has been determined yet.");return f(this,De)[0]}},De=new WeakMap,Re=new WeakMap,Yt),it=Object.create(null),Ne,re,Be,tt,ee,Se,qe,Gt,mn=(Gt=class{constructor(e,t,r){T(this,Se);T(this,Ne);T(this,re);T(this,Be);T(this,tt,0);T(this,ee,it);if(w(this,re,r||Object.create(null)),w(this,Ne,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},w(this,Ne,[n])}w(this,Be,[])}insert(e,t,r){w(this,tt,++It(this,tt)._);let n=this;const s=$n(t),i=[];for(let a=0,c=s.length;a<c;a++){const l=s[a],o=s[a+1],h=Dn(l,o),p=Array.isArray(h)?h[0]:l;if(p in f(n,re)){n=f(n,re)[p],h&&i.push(h[1]);continue}f(n,re)[p]=new mn,h&&(f(n,Be).push(h),i.push(h[1])),n=f(n,re)[p]}return f(n,Ne).push({[e]:{handler:r,possibleKeys:i.filter((a,c,l)=>l.indexOf(a)===c),score:f(this,tt)}}),n}search(e,t){var c;const r=[];w(this,ee,it);let s=[this];const i=Xt(t),a=[];for(let l=0,o=i.length;l<o;l++){const h=i[l],p=l===o-1,g=[];for(let y=0,N=s.length;y<N;y++){const O=s[y],M=f(O,re)[h];M&&(w(M,ee,f(O,ee)),p?(f(M,re)["*"]&&r.push(...L(this,Se,qe).call(this,f(M,re)["*"],e,f(O,ee))),r.push(...L(this,Se,qe).call(this,M,e,f(O,ee)))):g.push(M));for(let H=0,ae=f(O,Be).length;H<ae;H++){const Oe=f(O,Be)[H],oe=f(O,ee)===it?{}:{...f(O,ee)};if(Oe==="*"){const m=f(O,re)["*"];m&&(r.push(...L(this,Se,qe).call(this,m,e,f(O,ee))),w(m,ee,oe),g.push(m));continue}const[Fe,he,I]=Oe;if(!h&&!(I instanceof RegExp))continue;const u=f(O,re)[Fe],d=i.slice(l).join("/");if(I instanceof RegExp){const m=I.exec(d);if(m){if(oe[he]=m[0],r.push(...L(this,Se,qe).call(this,u,e,f(O,ee),oe)),Object.keys(f(u,re)).length){w(u,ee,oe);const b=((c=m[0].match(/\//))==null?void 0:c.length)??0;(a[b]||(a[b]=[])).push(u)}continue}}(I===!0||I.test(h))&&(oe[he]=h,p?(r.push(...L(this,Se,qe).call(this,u,e,oe,f(O,ee))),f(u,re)["*"]&&r.push(...L(this,Se,qe).call(this,f(u,re)["*"],e,oe,f(O,ee)))):(w(u,ee,oe),g.push(u)))}}s=g.concat(a.shift()??[])}return r.length>1&&r.sort((l,o)=>l.score-o.score),[r.map(({handler:l,params:o})=>[l,o])]}},Ne=new WeakMap,re=new WeakMap,Be=new WeakMap,tt=new WeakMap,ee=new WeakMap,Se=new WeakSet,qe=function(e,t,r,n){const s=[];for(let i=0,a=f(e,Ne).length;i<a;i++){const c=f(e,Ne)[i],l=c[t]||c[G],o={};if(l!==void 0&&(l.params=Object.create(null),s.push(l),r!==it||n&&n!==it))for(let h=0,p=l.possibleKeys.length;h<p;h++){const g=l.possibleKeys[h],y=o[l.score];l.params[g]=n!=null&&n[g]&&!y?n[g]:r[g]??(n==null?void 0:n[g]),o[l.score]=!0}}return s},Gt),Ue,Qt,er=(Qt=class{constructor(){_(this,"name","TrieRouter");T(this,Ue);w(this,Ue,new mn)}add(e,t,r){const n=en(t);if(n){for(let s=0,i=n.length;s<i;s++)f(this,Ue).insert(e,n[s],r);return}f(this,Ue).insert(e,t,r)}match(e,t){return f(this,Ue).search(e,t)}},Ue=new WeakMap,Qt),Me=class extends un{constructor(e={}){super(e),this.router=e.router??new Zn({routers:[new Xn,new er]})}},tr=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(i=>typeof i=="string"?i==="*"?()=>i:a=>i===a?a:null:typeof i=="function"?i:a=>i.includes(a)?a:null)(r.origin),s=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(r.allowMethods);return async function(a,c){var h;function l(p,g){a.res.headers.set(p,g)}const o=await n(a.req.header("origin")||"",a);if(o&&l("Access-Control-Allow-Origin",o),r.origin!=="*"){const p=a.req.header("Vary");p?l("Vary",p):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),a.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const p=await s(a.req.header("origin")||"",a);p.length&&l("Access-Control-Allow-Methods",p.join(","));let g=r.allowHeaders;if(!(g!=null&&g.length)){const y=a.req.header("Access-Control-Request-Headers");y&&(g=y.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),a.res.headers.append("Vary","Access-Control-Request-Headers")),a.res.headers.delete("Content-Length"),a.res.headers.delete("Content-Type"),new Response(null,{headers:a.res.headers,status:204,statusText:"No Content"})}await c()}},nr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,qt=(e,t=sr)=>{const r=/\.([a-zA-Z0-9]+?)$/,n=e.match(r);if(!n)return;let s=t[n[1]];return s&&s.startsWith("text")&&(s+="; charset=utf-8"),s},rr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},sr=rr,ir=(...e)=>{let t=e.filter(s=>s!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),n=[];for(const s of r)s===".."&&n.length>0&&n.at(-1)!==".."?n.pop():s!=="."&&n.push(s);return n.join("/")||"."},gn={br:".br",zstd:".zst",gzip:".gz"},ar=Object.keys(gn),or="index.html",lr=e=>{const t=e.root??"./",r=e.path,n=e.join??ir;return async(s,i)=>{var h,p,g,y;if(s.finalized)return i();let a;if(e.path)a=e.path;else try{if(a=decodeURIComponent(s.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(a))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,s.req.path,s)),i()}let c=n(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(a):a);e.isDir&&await e.isDir(c)&&(c=n(c,or));const l=e.getContent;let o=await l(c,s);if(o instanceof Response)return s.newResponse(o.body,o);if(o){const N=e.mimes&&qt(c,e.mimes)||qt(c);if(s.header("Content-Type",N||"application/octet-stream"),e.precompressed&&(!N||nr.test(N))){const O=new Set((p=s.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(M=>M.trim()));for(const M of ar){if(!O.has(M))continue;const H=await l(c+gn[M],s);if(H){o=H,s.header("Content-Encoding",M),s.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,s)),s.body(o)}await((y=e.onNotFound)==null?void 0:y.call(e,c,s)),await i()}},cr=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const s=r[e]||e;if(!s)return null;const i=await n.get(s,{type:"stream"});return i||null},ur=e=>async function(r,n){return lr({...e,getContent:async i=>cr(i,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,n)},dr=e=>ur(e);function hr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var xt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var fr=xt.exports,Pt;function pr(){return Pt||(Pt=1,(function(e,t){((r,n)=>{e.exports=n()})(fr,function r(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},s,i=!n.document&&!!n.postMessage,a=n.IS_PAPA_WORKER||!1,c={},l=0,o={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var m=Fe(d);m.chunkSize=parseInt(m.chunkSize),d.step||d.chunk||(m.chunkSize=null),this._handle=new O(m),(this._handle.streamer=this)._config=m}).call(this,u),this.parseChunk=function(d,m){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let k=this._config.newline;k||(v=this._config.quoteChar||'"',k=this._handle.guessLineEndings(d,v)),d=[...d.split(k).slice(b)].join(k)}this.isFirstChunk&&I(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),a)n.postMessage({results:v,workerId:o.WORKER_ID,finished:b});else if(I(this._config.chunk)&&!m){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!I(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){I(this._config.error)?this._config.error(d):a&&this._config.error&&n.postMessage({workerId:o.WORKER_ID,error:d,finished:!1})}}function p(u){var d;(u=u||{}).chunkSize||(u.chunkSize=o.RemoteChunkSize),h.call(this,u),this._nextChunk=i?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(m){this._input=m,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),i||(d.onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!i),this._config.downloadRequestHeaders){var m,b=this._config.downloadRequestHeaders;for(m in b)d.setRequestHeader(m,b[m])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(k){this._chunkError(k.message)}i&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(m=>(m=m.getResponseHeader("Content-Range"))!==null?parseInt(m.substring(m.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(m){m=d.statusText||m,this._sendError(new Error(m))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=o.LocalChunkSize),h.call(this,u);var d,m,b=typeof FileReader<"u";this.stream=function(v){this._input=v,m=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,k=(this._config.chunkSize&&(k=Math.min(this._start+this._config.chunkSize,this._input.size),v=m.call(v,this._start,k)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:k}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(m){return d=m,this._nextChunk()},this._nextChunk=function(){var m,b;if(!this._finished)return m=this._config.chunkSize,d=m?(b=d.substring(0,m),d.substring(m)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function N(u){h.call(this,u=u||{});var d=[],m=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):m=!0},this._streamData=he(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),m&&(m=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(k){this._streamError(k)}},this),this._streamError=he(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=he(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=he(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function O(u){var d,m,b,v,k=Math.pow(2,53),J=-k,le=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ce=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,$=this,B=0,E=0,te=!1,S=!1,j=[],x={data:[],errors:[],meta:{}};function K(A){return u.skipEmptyLines==="greedy"?A.join("").trim()==="":A.length===1&&A[0].length===0}function V(){if(x&&b&&(ue("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+o.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(x.data=x.data.filter(function(R){return!K(R)})),Z()){let R=function(W,Y){I(u.transformHeader)&&(W=u.transformHeader(W,Y)),j.push(W)};if(x)if(Array.isArray(x.data[0])){for(var A=0;Z()&&A<x.data.length;A++)x.data[A].forEach(R);x.data.splice(0,1)}else x.data.forEach(R)}function F(R,W){for(var Y=u.header?{}:[],q=0;q<R.length;q++){var P=q,D=R[q],D=((fe,C)=>(z=>(u.dynamicTypingFunction&&u.dynamicTyping[z]===void 0&&(u.dynamicTyping[z]=u.dynamicTypingFunction(z)),(u.dynamicTyping[z]||u.dynamicTyping)===!0))(fe)?C==="true"||C==="TRUE"||C!=="false"&&C!=="FALSE"&&((z=>{if(le.test(z)&&(z=parseFloat(z),J<z&&z<k))return 1})(C)?parseFloat(C):ce.test(C)?new Date(C):C===""?null:C):C)(P=u.header?q>=j.length?"__parsed_extra":j[q]:P,D=u.transform?u.transform(D,P):D);P==="__parsed_extra"?(Y[P]=Y[P]||[],Y[P].push(D)):Y[P]=D}return u.header&&(q>j.length?ue("FieldMismatch","TooManyFields","Too many fields: expected "+j.length+" fields but parsed "+q,E+W):q<j.length&&ue("FieldMismatch","TooFewFields","Too few fields: expected "+j.length+" fields but parsed "+q,E+W)),Y}var U;x&&(u.header||u.dynamicTyping||u.transform)&&(U=1,!x.data.length||Array.isArray(x.data[0])?(x.data=x.data.map(F),U=x.data.length):x.data=F(x.data,0),u.header&&x.meta&&(x.meta.fields=j),E+=U)}function Z(){return u.header&&j.length===0}function ue(A,F,U,R){A={type:A,code:F,message:U},R!==void 0&&(A.row=R),x.errors.push(A)}I(u.step)&&(v=u.step,u.step=function(A){x=A,Z()?V():(V(),x.data.length!==0&&(B+=A.data.length,u.preview&&B>u.preview?m.abort():(x.data=x.data[0],v(x,$))))}),this.parse=function(A,F,U){var R=u.quoteChar||'"',R=(u.newline||(u.newline=this.guessLineEndings(A,R)),b=!1,u.delimiter?I(u.delimiter)&&(u.delimiter=u.delimiter(A),x.meta.delimiter=u.delimiter):((R=((W,Y,q,P,D)=>{var fe,C,z,Te;D=D||[",","	","|",";",o.RECORD_SEP,o.UNIT_SEP];for(var We=0;We<D.length;We++){for(var be,rt=D[We],ne=0,ve=0,X=0,ie=(z=void 0,new H({comments:P,delimiter:rt,newline:Y,preview:10}).parse(W)),we=0;we<ie.data.length;we++)q&&K(ie.data[we])?X++:(be=ie.data[we].length,ve+=be,z===void 0?z=be:0<be&&(ne+=Math.abs(be-z),z=be));0<ie.data.length&&(ve/=ie.data.length-X),(C===void 0||ne<=C)&&(Te===void 0||Te<ve)&&1.99<ve&&(C=ne,fe=rt,Te=ve)}return{successful:!!(u.delimiter=fe),bestDelimiter:fe}})(A,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=R.bestDelimiter:(b=!0,u.delimiter=o.DefaultDelimiter),x.meta.delimiter=u.delimiter),Fe(u));return u.preview&&u.header&&R.preview++,d=A,m=new H(R),x=m.parse(d,F,U),V(),te?{meta:{paused:!0}}:x||{meta:{paused:!1}}},this.paused=function(){return te},this.pause=function(){te=!0,m.abort(),d=I(u.chunk)?"":d.substring(m.getCharIndex())},this.resume=function(){$.streamer._halted?(te=!1,$.streamer.parseChunk(d,!0)):setTimeout($.resume,3)},this.aborted=function(){return S},this.abort=function(){S=!0,m.abort(),x.meta.aborted=!0,I(u.complete)&&u.complete(x),d=""},this.guessLineEndings=function(W,R){W=W.substring(0,1048576);var R=new RegExp(M(R)+"([^]*?)"+M(R),"gm"),U=(W=W.replace(R,"")).split("\r"),R=W.split(`
`),W=1<R.length&&R[0].length<U[0].length;if(U.length===1||W)return`
`;for(var Y=0,q=0;q<U.length;q++)U[q][0]===`
`&&Y++;return Y>=U.length/2?`\r
`:"\r"}}function M(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function H(u){var d=(u=u||{}).delimiter,m=u.newline,b=u.comments,v=u.step,k=u.preview,J=u.fastMode,le=null,ce=!1,$=u.quoteChar==null?'"':u.quoteChar,B=$;if(u.escapeChar!==void 0&&(B=u.escapeChar),(typeof d!="string"||-1<o.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<o.BAD_DELIMITERS.indexOf(b))&&(b=!1),m!==`
`&&m!=="\r"&&m!==`\r
`&&(m=`
`);var E=0,te=!1;this.parse=function(S,j,x){if(typeof S!="string")throw new Error("Input must be a string");var K=S.length,V=d.length,Z=m.length,ue=b.length,A=I(v),F=[],U=[],R=[],W=E=0;if(!S)return ne();if(J||J!==!1&&S.indexOf($)===-1){for(var Y=S.split(m),q=0;q<Y.length;q++){if(R=Y[q],E+=R.length,q!==Y.length-1)E+=m.length;else if(x)return ne();if(!b||R.substring(0,ue)!==b){if(A){if(F=[],Te(R.split(d)),ve(),te)return ne()}else Te(R.split(d));if(k&&k<=q)return F=F.slice(0,k),ne(!0)}}return ne()}for(var P=S.indexOf(d,E),D=S.indexOf(m,E),fe=new RegExp(M(B)+M($),"g"),C=S.indexOf($,E);;)if(S[E]===$)for(C=E,E++;;){if((C=S.indexOf($,C+1))===-1)return x||U.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:F.length,index:E}),be();if(C===K-1)return be(S.substring(E,C).replace(fe,$));if($===B&&S[C+1]===B)C++;else if($===B||C===0||S[C-1]!==B){P!==-1&&P<C+1&&(P=S.indexOf(d,C+1));var z=We((D=D!==-1&&D<C+1?S.indexOf(m,C+1):D)===-1?P:Math.min(P,D));if(S.substr(C+1+z,V)===d){R.push(S.substring(E,C).replace(fe,$)),S[E=C+1+z+V]!==$&&(C=S.indexOf($,E)),P=S.indexOf(d,E),D=S.indexOf(m,E);break}if(z=We(D),S.substring(C+1+z,C+1+z+Z)===m){if(R.push(S.substring(E,C).replace(fe,$)),rt(C+1+z+Z),P=S.indexOf(d,E),C=S.indexOf($,E),A&&(ve(),te))return ne();if(k&&F.length>=k)return ne(!0);break}U.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:F.length,index:E}),C++}}else if(b&&R.length===0&&S.substring(E,E+ue)===b){if(D===-1)return ne();E=D+Z,D=S.indexOf(m,E),P=S.indexOf(d,E)}else if(P!==-1&&(P<D||D===-1))R.push(S.substring(E,P)),E=P+V,P=S.indexOf(d,E);else{if(D===-1)break;if(R.push(S.substring(E,D)),rt(D+Z),A&&(ve(),te))return ne();if(k&&F.length>=k)return ne(!0)}return be();function Te(X){F.push(X),W=E}function We(X){var ie=0;return ie=X!==-1&&(X=S.substring(C+1,X))&&X.trim()===""?X.length:ie}function be(X){return x||(X===void 0&&(X=S.substring(E)),R.push(X),E=K,Te(R),A&&ve()),ne()}function rt(X){E=X,Te(R),R=[],D=S.indexOf(m,E)}function ne(X){if(u.header&&!j&&F.length&&!ce){var ie=F[0],we=Object.create(null),St=new Set(ie);let At=!1;for(let Ve=0;Ve<ie.length;Ve++){let xe=ie[Ve];if(we[xe=I(u.transformHeader)?u.transformHeader(xe,Ve):xe]){let st,Dt=we[xe];for(;st=xe+"_"+Dt,Dt++,St.has(st););St.add(st),ie[Ve]=st,we[xe]++,At=!0,(le=le===null?{}:le)[st]=xe}else we[xe]=1,ie[Ve]=xe;St.add(xe)}At&&console.warn("Duplicate headers found and renamed."),ce=!0}return{data:F,errors:U,meta:{delimiter:d,linebreak:m,aborted:te,truncated:!!X,cursor:W+(j||0),renamedHeaders:le}}}function ve(){v(ne()),F=[],U=[]}},this.abort=function(){te=!0},this.getCharIndex=function(){return E}}function ae(u){var d=u.data,m=c[d.workerId],b=!1;if(d.error)m.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,Oe(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:oe,resume:oe};if(I(m.userStep)){for(var k=0;k<d.results.data.length&&(m.userStep({data:d.results.data[k],errors:d.results.errors,meta:d.results.meta},v),!b);k++);delete d.results}else I(m.userChunk)&&(m.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&Oe(d.workerId,d.results)}function Oe(u,d){var m=c[u];I(m.userComplete)&&m.userComplete(d),m.terminate(),delete c[u]}function oe(){throw new Error("Not implemented.")}function Fe(u){if(typeof u!="object"||u===null)return u;var d,m=Array.isArray(u)?[]:{};for(d in u)m[d]=Fe(u[d]);return m}function he(u,d){return function(){u.apply(d,arguments)}}function I(u){return typeof u=="function"}return o.parse=function(u,d){var m=(d=d||{}).dynamicTyping||!1;if(I(m)&&(d.dynamicTypingFunction=m,m={}),d.dynamicTyping=m,d.transform=!!I(d.transform)&&d.transform,!d.worker||!o.WORKERS_SUPPORTED)return m=null,o.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),m=new(d.download?p:y)(d)):u.readable===!0&&I(u.read)&&I(u.on)?m=new N(d):(n.File&&u instanceof File||u instanceof Object)&&(m=new g(d)),m.stream(u);(m=(()=>{var b;return!!o.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,k=r.toString();return o.BLOB_URL||(o.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",k,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=ae,b.id=l++,c[b.id]=b)})()).userStep=d.step,m.userChunk=d.chunk,m.userComplete=d.complete,m.userError=d.error,d.step=I(d.step),d.chunk=I(d.chunk),d.complete=I(d.complete),d.error=I(d.error),delete d.worker,m.postMessage({input:u,config:d,workerId:m.id})},o.unparse=function(u,d){var m=!1,b=!0,v=",",k=`\r
`,J='"',le=J+J,ce=!1,$=null,B=!1,E=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||o.BAD_DELIMITERS.filter(function(j){return d.delimiter.indexOf(j)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(m=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(ce=d.skipEmptyLines),typeof d.newline=="string"&&(k=d.newline),typeof d.quoteChar=="string"&&(J=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");$=d.columns}d.escapeChar!==void 0&&(le=d.escapeChar+J),d.escapeFormulae instanceof RegExp?B=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(B=/^[=+\-@\t\r].*$/)}})(),new RegExp(M(J),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return te(null,u,ce);if(typeof u[0]=="object")return te($||Object.keys(u[0]),u,ce)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||$),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),te(u.fields||[],u.data||[],ce);throw new Error("Unable to serialize unrecognized input");function te(j,x,K){var V="",Z=(typeof j=="string"&&(j=JSON.parse(j)),typeof x=="string"&&(x=JSON.parse(x)),Array.isArray(j)&&0<j.length),ue=!Array.isArray(x[0]);if(Z&&b){for(var A=0;A<j.length;A++)0<A&&(V+=v),V+=S(j[A],A);0<x.length&&(V+=k)}for(var F=0;F<x.length;F++){var U=(Z?j:x[F]).length,R=!1,W=Z?Object.keys(x[F]).length===0:x[F].length===0;if(K&&!Z&&(R=K==="greedy"?x[F].join("").trim()==="":x[F].length===1&&x[F][0].length===0),K==="greedy"&&Z){for(var Y=[],q=0;q<U;q++){var P=ue?j[q]:q;Y.push(x[F][P])}R=Y.join("").trim()===""}if(!R){for(var D=0;D<U;D++){0<D&&!W&&(V+=v);var fe=Z&&ue?j[D]:D;V+=S(x[F][fe],D)}F<x.length-1&&(!K||0<U&&!W)&&(V+=k)}}return V}function S(j,x){var K,V;return j==null?"":j.constructor===Date?JSON.stringify(j).slice(1,25):(V=!1,B&&typeof j=="string"&&B.test(j)&&(j="'"+j,V=!0),K=j.toString().replace(E,le),(V=V||m===!0||typeof m=="function"&&m(j,x)||Array.isArray(m)&&m[x]||((Z,ue)=>{for(var A=0;A<ue.length;A++)if(-1<Z.indexOf(ue[A]))return!0;return!1})(K,o.BAD_DELIMITERS)||-1<K.indexOf(v)||K.charAt(0)===" "||K.charAt(K.length-1)===" ")?J+K+J:K)}},o.RECORD_SEP="",o.UNIT_SEP="",o.BYTE_ORDER_MARK="\uFEFF",o.BAD_DELIMITERS=["\r",`
`,'"',o.BYTE_ORDER_MARK],o.WORKERS_SUPPORTED=!i&&!!n.Worker,o.NODE_STREAM_INPUT=1,o.LocalChunkSize=10485760,o.RemoteChunkSize=5242880,o.DefaultDelimiter=",",o.Parser=H,o.ParserHandle=O,o.NetworkStreamer=p,o.FileStreamer=g,o.StringStreamer=y,o.ReadableStreamStreamer=N,n.jQuery&&((s=n.jQuery).fn.parse=function(u){var d=u.config||{},m=[];return this.each(function(k){if(!(s(this).prop("tagName").toUpperCase()==="INPUT"&&s(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var J=0;J<this.files.length;J++)m.push({file:this.files[J],inputElem:this,instanceConfig:s.extend({},d)})}),b(),this;function b(){if(m.length===0)I(u.complete)&&u.complete();else{var k,J,le,ce,$=m[0];if(I(u.before)){var B=u.before($.file,$.inputElem);if(typeof B=="object"){if(B.action==="abort")return k="AbortError",J=$.file,le=$.inputElem,ce=B.reason,void(I(u.error)&&u.error({name:k},J,le,ce));if(B.action==="skip")return void v();typeof B.config=="object"&&($.instanceConfig=s.extend($.instanceConfig,B.config))}else if(B==="skip")return void v()}var E=$.instanceConfig.complete;$.instanceConfig.complete=function(te){I(E)&&E(te,$.file,$.inputElem),v()},o.parse($.file,$.instanceConfig)}}function v(){m.splice(0,1),b()}}),a&&(n.onmessage=function(u){u=u.data,o.WORKER_ID===void 0&&u&&(o.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:o.WORKER_ID,results:o.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=o.parse(u.input,u.config))&&n.postMessage({workerId:o.WORKER_ID,results:u,finished:!0})}),(p.prototype=Object.create(h.prototype)).constructor=p,(g.prototype=Object.create(h.prototype)).constructor=g,(y.prototype=Object.create(y.prototype)).constructor=y,(N.prototype=Object.create(h.prototype)).constructor=N,o})})(xt)),xt.exports}var mr=pr();const gr=hr(mr);function yr(e){const t=gr.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:r=>r.trim()});return t.errors.length>0&&console.warn("CSV parsing warnings:",t.errors.slice(0,5)),t.data}function br(e){if(e.length===0)return{};const t=Object.keys(e[0]),r={};for(const n of t){const s=e.slice(0,Math.min(100,e.length)).map(i=>i[n]);r[n]=vr(s)}return r}function vr(e){const t=e.filter(i=>i!=null&&i!=="");if(t.length===0)return"string";if(t.filter(i=>typeof i=="number").length===t.length)return"number";if(t.filter(i=>typeof i=="boolean").length===t.length)return"boolean";const s=t.filter(i=>{if(typeof i=="string"){const a=Date.parse(i);return!isNaN(a)}return!1}).length;return s===t.length&&s>0?"date":"string"}function xr(e,t){const r=[];for(const n of e){const s=n.name.toLowerCase();if(!((s.endsWith("id")||s.endsWith("_id")||s==="id")&&n.type==="number"))continue;const a=n.name.replace(/[_-]?id$/i,""),c=[`${a}Name`,`${a}_name`,`${a}name`,`${a.toLowerCase()}name`,`${a}`];for(const l of c){const o=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(o){const h=n.unique_count/t,p=o.unique_count/t;let g=.5;Math.abs(h-p)<.2?g=.9:Math.abs(h-p)<.4&&(g=.7),r.push({id_column:n.name,name_column:o.name,confidence:g});break}}}return r.filter(n=>n.confidence>=.5)}function wr(e,t){if(t.length===0)return e;const r=new Map;for(const n of t){const s=new Map;for(const i of e){const a=i[n.id_column],c=i[n.name_column];a!=null&&c&&s.set(a,c)}r.set(n.id_column,s)}return e.map(n=>{const s={...n};for(const i of t){const a=s[i.id_column],c=r.get(i.id_column);c&&c.has(a)&&(s[`${i.id_column}_original`]=a,s[i.id_column]=c.get(a))}return s})}const yn=new Me;yn.post("/",async e=>{try{const r=(await e.req.formData()).get("file");if(!r)return e.json({error:"No file provided"},400);const n=r.name,s=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!s)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(r.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const i=await r.text();let a;if(s==="csv")a=yr(i);else try{const g=JSON.parse(i);a=Array.isArray(g)?g:[g]}catch{return e.json({error:"Invalid JSON format"},400)}if(a.length===0)return e.json({error:"File contains no data"},400);if(a.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=br(a),l=Object.keys(a[0]).map(g=>({name:g,type:c[g]||"string",nullable:a.some(y=>y[g]===null||y[g]===void 0||y[g]===""),unique_count:new Set(a.map(y=>y[g])).size,sample_values:a.slice(0,3).map(y=>y[g])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,s,a.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id;for(let g=0;g<a.length;g++)await e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,g,JSON.stringify(a[g]),0).run();console.log("Detecting column mappings...");const p=xr(l,a.length);console.log(`Detected ${p.length} column mappings`);for(const g of p)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,g.id_column,g.name_column).run(),console.log(`  Mapped: ${g.id_column} -> ${g.name_column} (confidence: ${g.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:a.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Me;nt.get("/",async e=>{try{const r=(await e.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all()).results.map(n=>({...n,columns:JSON.parse(n.columns)}));return e.json({datasets:r})}catch{return e.json({error:"Failed to fetch datasets"},500)}});nt.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const s=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(t).all()).results.map(i=>JSON.parse(i.data));return e.json({dataset:{...r,columns:JSON.parse(r.columns)},sample:s})}catch{return e.json({error:"Failed to fetch dataset"},500)}});nt.get("/:id/analyses",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(t).all()).results.map(s=>({...s,result:JSON.parse(s.result)}));return e.json({analyses:n})}catch{return e.json({error:"Failed to fetch analyses"},500)}});nt.get("/:id/visualizations",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(t).all()).results.map(s=>({...s,config:JSON.parse(s.config)}));return e.json({visualizations:n})}catch{return e.json({error:"Failed to fetch visualizations"},500)}});nt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function _r(e,t){const r=e.filter(i=>i!=null&&i!==""),n=e.length-r.length,s=new Set(r).size;if(t==="number"){const i=r.map(a=>Number(a)).filter(a=>!isNaN(a));return{count:e.length,mean:Ie(i),median:Er(i),mode:Ht(i),stdDev:Rr(i),min:Math.min(...i),max:Math.max(...i),q1:ct(i,25),q2:ct(i,50),q3:ct(i,75),nullCount:n,uniqueCount:s}}return{count:e.length,mode:Ht(r),min:r[0],max:r[r.length-1],nullCount:n,uniqueCount:s}}function Ie(e){return e.length===0?0:e.reduce((t,r)=>t+r,0)/e.length}function Er(e){if(e.length===0)return 0;const t=[...e].sort((n,s)=>n-s),r=Math.floor(t.length/2);return t.length%2===0?(t[r-1]+t[r])/2:t[r]}function Ht(e){if(e.length===0)return null;const t={};let r=0,n=null;for(const s of e){const i=String(s);t[i]=(t[i]||0)+1,t[i]>r&&(r=t[i],n=s)}return n}function Rr(e){if(e.length===0)return 0;const t=Ie(e),r=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Ie(r))}function ct(e,t){if(e.length===0)return 0;const r=[...e].sort((c,l)=>c-l),n=t/100*(r.length-1),s=Math.floor(n),i=Math.ceil(n),a=n%1;return s===i?r[s]:r[s]*(1-a)+r[i]*a}function Sr(e){if(e.length<4)return{indices:[],threshold:0};const t=ct(e,25),r=ct(e,75),n=r-t,s=t-1.5*n,i=r+1.5*n,a=[];return e.forEach((c,l)=>{(c<s||c>i)&&a.push(l)}),{indices:a,threshold:n}}function Cr(e,t){if(e.length!==t.length||e.length===0)return 0;const r=e.length,n=Ie(e),s=Ie(t);let i=0,a=0,c=0;for(let l=0;l<r;l++){const o=e[l]-n,h=t[l]-s;i+=o*h,a+=o*o,c+=h*h}return a===0||c===0?0:i/Math.sqrt(a*c)}function Or(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,r=Array.from({length:t},(o,h)=>h),n=Ie(r),s=Ie(e);let i=0,a=0;for(let o=0;o<t;o++)i+=(r[o]-n)*(e[o]-s),a+=Math.pow(r[o]-n,2);const c=a===0?0:i/a,l=Math.min(Math.abs(c)/(Ie(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function at(e,t,r,n){var a;let s=50;const i=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(s-=30,i.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(s-=25,i.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(s-=30,i.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(s-=20,i.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(s-=40,i.push("All values are identical")):n.uniqueCount===n.count?(s-=35,i.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(s-=25,i.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(s+=20,i.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(s+=15,i.push("High variability in data"));break;case"correlation":const c=Math.abs(r.correlation||0);c>.8?(s+=30,i.push("Very strong correlation")):c>.6?(s+=20,i.push("Strong correlation")):c>.5&&(s+=10,i.push("Moderate correlation"));break;case"outlier":const o=(r.count||0)/(n.count||1);o>.05&&o<.2?(s+=25,i.push("Significant outliers detected")):o>0&&(s+=10,i.push("Some outliers present"));break;case"pattern":const h=(a=r.topPatterns)==null?void 0:a[0];if(h){const[,g]=h,y=g/n.count;y>.3&&y<.9&&(s+=20,i.push("Clear dominant pattern"))}break;case"trend":const p=r.strength||0;p>.5?(s+=30,i.push("Strong trend detected")):p>.3&&(s+=15,i.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(s-=30,i.push("More than 50% missing data")):c>.2&&(s-=15,i.push("Significant missing data"))}return s=Math.max(0,Math.min(100,s)),{score:s,reasons:i}}async function Tr(e,t,r,n){console.log(`Starting analysis for dataset ${e}`);for(const i of r){const a=t.map(p=>p[i.name]),c=_r(a,i.type),l=kr(i.name,i.type,c),o=jr(c,i.type),h=at("statistics",i.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",i.name,JSON.stringify(c),1,l,o,h.score).run(),i.type==="number"){const p=a.map(y=>Number(y)).filter(y=>!isNaN(y)),g=Sr(p);if(g.indices.length>0){const y=`Found ${g.indices.length} unusual values in "${i.name}" (${(g.indices.length/p.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,N={count:g.indices.length,indices:g.indices.slice(0,10)},O=at("outlier",i.name,N,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",i.name,JSON.stringify(N),.85,y,g.indices.length>p.length*.05?"high":"medium",O.score).run()}if(p.length>5){const y=Or(p);if(y.direction!=="stable"){const N=`"${i.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,O=at("trend",i.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",i.name,JSON.stringify(y),y.strength,N,y.strength>.5?"high":"medium",O.score).run()}}}}const s=r.filter(i=>i.type==="number");for(let i=0;i<s.length;i++)for(let a=i+1;a<s.length;a++){const c=s[i],l=s[a],o=t.map(p=>Number(p[c.name])).filter(p=>!isNaN(p)),h=t.map(p=>Number(p[l.name])).filter(p=>!isNaN(p));if(o.length>5&&h.length>5){const p=Cr(o,h);if(Math.abs(p)>.5){const g=$r(c.name,l.name,p),y={column1:c.name,column2:l.name,correlation:p},N=at("correlation",void 0,y,{count:o.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(p),g,Math.abs(p)>.7?"high":"medium",N.score).run()}}}for(const i of r)if(i.type==="string"){const a=t.map(h=>h[i.name]).filter(h=>h),c={};a.forEach(h=>{c[h]=(c[h]||0)+1});const o=Object.entries(c).sort((h,p)=>p[1]-h[1]).slice(0,5);if(o.length>0&&o[0][1]>a.length*.1){const h=`The most common value in "${i.name}" is "${o[0][0]}" appearing ${o[0][1]} times (${(o[0][1]/a.length*100).toFixed(1)}% of records).`,p={topPatterns:o},g={count:a.length,uniqueCount:new Set(a).size},y=at("pattern",i.name,p,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",i.name,JSON.stringify(p),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function kr(e,t,r){var n,s,i,a;return t==="number"?`"${e}" ranges from ${(n=r.min)==null?void 0:n.toFixed(2)} to ${(s=r.max)==null?void 0:s.toFixed(2)} with an average of ${(i=r.mean)==null?void 0:i.toFixed(2)}. About half the values are below ${(a=r.median)==null?void 0:a.toFixed(2)}.`:`"${e}" contains ${r.count} values with ${r.uniqueCount} unique entries. Most common: "${r.mode}".`}function $r(e,t,r){const n=Math.abs(r)>.7?"strong":"moderate";return r>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${r.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${r.toFixed(2)}).`}function jr(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function Ar(e,t,r,n){console.log(`Generating visualizations for dataset ${e}`);const s=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),i=new Map;s.results.forEach(l=>{i.set(l.id_column,l.name_column)});let a=0;const c=[...r].sort((l,o)=>(o.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const o=await Dr(l,t,i);o&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,o.chartType,o.title,JSON.stringify(o.config),o.explanation,a++).run()}console.log(`Generated ${a} visualizations`)}function Dr(e,t,r){switch(e.analysis_type){case"statistics":return Nr(e,t,r);case"correlation":return Ir(e,t,r);case"outlier":return Mr(e,t,r);case"pattern":return Fr(e,t,r);case"trend":return Lr(e,t,r);default:return null}}function Nr(e,t,r){const n=e.column_name;if(!n)return null;const s=e.result,i=r.has(n)?` (via ${r.get(n)})`:"";if(s.mean!==void 0){const o=t.map(p=>Number(p[n])).filter(p=>!isNaN(p)),h=qr(o);return{chartType:"bar",title:`Distribution: ${n}${i}`,explanation:`This histogram shows how values in "${n}" are distributed${i?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const a=t.map(o=>o[n]).filter(o=>o!=null),c={};a.forEach(o=>{c[String(o)]=(c[String(o)]||0)+1});const l=Object.entries(c).sort((o,h)=>h[1]-o[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${i}`,explanation:`This chart shows the most common values in "${n}"${i?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([o])=>o),datasets:[{label:"Count",data:l.map(([,o])=>o),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function Ir(e,t,r){const n=e.result,s=n.column1,i=n.column2;if(!s||!i)return null;const a=r.has(s)?` (via ${r.get(s)})`:"",c=r.has(i)?` (via ${r.get(i)})`:"",l=t.map(p=>({x:Number(p[s]),y:Number(p[i])})).filter(p=>!isNaN(p.x)&&!isNaN(p.y)),o=n.correlation,h=o>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${s}${a} vs ${i}${c}`,explanation:`Each dot represents one record${a||c?" using human-readable names":""}. ${o>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${s} vs ${i}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${o.toFixed(2)}`}},scales:{x:{title:{display:!0,text:s}},y:{title:{display:!0,text:i}}}}}}}function Mr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",i=new Set(e.result.indices||[]),a=t.map((o,h)=>({x:h,y:Number(o[n]),isOutlier:i.has(h)})).filter(o=>!isNaN(o.y)),c=a.filter(o=>!o.isOutlier),l=a.filter(o=>o.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${s}`,explanation:`Red dots are unusual values that stand out from the pattern${s?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Fr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",i=e.result.topPatterns||[];if(i.length===0)return null;const a=i.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${s}`,explanation:`Each slice shows what percentage of records have that value${s?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:a.map(([c])=>c),datasets:[{data:a.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Lr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",i=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),a=e.result,c=a.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${s}`,explanation:`This line shows how "${n}" changes over time${s?" using human-readable names":""}. ${a.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:i.map((l,o)=>`#${o+1}`),datasets:[{label:n,data:i,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${a.direction==="up"?"↗":"↘"} ${Math.round(a.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function qr(e,t=10){if(e.length===0)return{labels:[],data:[]};const r=Math.min(...e),i=(Math.max(...e)-r)/t,a=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const o=r+l*i,h=r+(l+1)*i;c.push(`${o.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let o=Math.floor((l-r)/i);o>=t&&(o=t-1),o<0&&(o=0),a[o]++}),{labels:c,data:a}}const bn=new Me;bn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);let s=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(o=>JSON.parse(o.data));const i=JSON.parse(r.columns),a=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(a.results.length>0){const o=a.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${o.length} column mappings for human-readable analysis...`),s=wr(s,o);for(const h of o){const p=i.find(g=>g.name===h.id_column);p&&(p.enriched_by=h.name_column)}}await Tr(t,s,i,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(o=>({...o,result:JSON.parse(o.result)}));return await Ar(t,s,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const vn=new Me;vn.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const n=JSON.parse(r.columns),i=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),a=[],c=[],l=new Map;for(const g of n){const y=`col_${g.name}`;if(!l.has(y)){const O=10+g.unique_count/r.row_count*30;a.push({id:y,label:g.name,type:"column",size:O}),l.set(y,!0)}}const o=i.filter(g=>g.analysis_type==="correlation"),h=o.sort((g,y)=>Math.abs(y.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,o.length));for(const g of h){const{column1:y,column2:N,correlation:O}=g.result,M=`col_${y}`,H=`col_${N}`;n.length>50&&Math.abs(O)<.7||c.push({source:M,target:H,type:"correlation",strength:Math.abs(O),label:`${O>0?"+":""}${O.toFixed(2)}`})}const p=i.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of p){const y=g.column_name;if(!y)continue;const{topPatterns:N}=g.result;if(!N||N.length===0)continue;const O=N.slice(0,3);for(const[M,H]of O){const ae=`val_${y}_${M}`;l.has(ae)||(a.push({id:ae,label:String(M),type:"value",size:5+H/r.row_count*20}),l.set(ae,!0)),c.push({source:`col_${y}`,target:ae,type:"contains",strength:H/r.row_count,label:`${H}x`})}}return e.json({nodes:a,edges:c,dataset_name:r.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const Rt=new Me;Rt.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),r=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:r.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});Rt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});Rt.post("/",async e=>{try{const{dataset_id:t,id_column:r,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,r,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const xn=new Me;xn.post("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),{message:r,conversationHistory:n}=await e.req.json(),s=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"Dataset not found"},404);const a=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC LIMIT 20
    `).bind(t).all()).results.map(p=>({type:p.analysis_type,column:p.column_name,importance:p.importance,confidence:p.confidence,quality_score:p.quality_score,explanation:p.explanation,result:JSON.parse(p.result)})),c=JSON.parse(s.columns),l=Pr(s,c,a),o=`You are a data analysis assistant helping users understand their dataset.

Dataset: ${s.name}
Rows: ${s.row_count}
Columns: ${s.column_count}

${l}

Your role:
- Explain findings in plain English
- Answer questions about patterns, correlations, outliers
- Suggest what to investigate next
- Provide statistical context when relevant
- Be concise but thorough

If asked about specific insights not in the context, politely explain what data you have access to.`,h={message:`I understand you're asking: "${r}". Let me analyze the data...
      
Based on the ${a.length} insights I've found in your dataset with ${s.row_count} rows:

${Hr(a,r)}

Would you like me to dive deeper into any specific finding?`,suggestions:["What are the strongest correlations?","Show me unusual patterns","Which columns have the most outliers?","Explain the most important finding"]};return e.json(h)}catch(t){return console.error("Chat error:",t),e.json({error:"Chat failed: "+t.message},500)}});function Pr(e,t,r){let n=`
Columns:
`;return t.slice(0,20).forEach(s=>{n+=`- ${s.name} (${s.type}, ${s.unique_count} unique values)
`}),t.length>20&&(n+=`... and ${t.length-20} more columns
`),n+=`
Top Insights:
`,r.forEach((s,i)=>{var a;n+=`${i+1}. ${s.type.toUpperCase()}`,s.column&&(n+=` on "${s.column}"`),n+=`: ${s.explanation}
`,n+=`   (${s.importance} importance, ${Math.round(s.confidence*100)}% confidence, quality: ${((a=s.quality_score)==null?void 0:a.toFixed(0))||"N/A"})
`}),n}function Hr(e,t){const r=t.toLowerCase();if(r.includes("correlat")||r.includes("relation")){const n=e.filter(s=>s.type==="correlation");if(n.length>0){const s=n[0];return`The strongest correlation is between ${s.result.column1} and ${s.result.column2} with a coefficient of ${s.result.correlation.toFixed(2)}. ${s.explanation}`}}if(r.includes("outlier")||r.includes("unusual")||r.includes("anomal")){const n=e.filter(s=>s.type==="outlier");if(n.length>0)return`I found outliers in ${n.length} columns. The most significant is in "${n[0].column}": ${n[0].explanation}`}if(r.includes("pattern")||r.includes("common")){const n=e.filter(s=>s.type==="pattern");if(n.length>0)return`I discovered ${n.length} significant patterns. The strongest is in "${n[0].column}": ${n[0].explanation}`}if(r.includes("trend")||r.includes("chang")||r.includes("over time")){const n=e.filter(s=>s.type==="trend");if(n.length>0)return`I detected ${n.length} trends. The most notable is in "${n[0].column}": ${n[0].explanation}`}if(r.includes("important")||r.includes("key")||r.includes("main")){const n=e.filter(s=>s.importance==="high");if(n.length>0)return`The most important finding is: ${n[0].explanation} (${Math.round(n[0].confidence*100)}% confident)`}return`I have access to ${e.length} insights across your dataset. The highest quality finding is: ${e[0].explanation}`}const ye=new Me;ye.use("/api/*",tr());ye.use("/static/*",dr({root:"./public"}));ye.route("/api/upload",yn);ye.route("/api/datasets",nt);ye.route("/api/analyze",bn);ye.route("/api/relationships",vn);ye.route("/api/mappings",Rt);ye.route("/api/chat",xn);ye.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));ye.get("/",e=>e.html(`
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
                        👋 Hi! I'm your data analysis assistant. I can help you understand patterns, correlations, and insights in your data. What would you like to know?
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
  `));const zt=new Me,zr=Object.assign({"/src/index.tsx":ye});let wn=!1;for(const[,e]of Object.entries(zr))e&&(zt.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),zt.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),wn=!0);if(!wn)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{zt as default};
