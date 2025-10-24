var En=Object.defineProperty;var Dt=e=>{throw TypeError(e)};var Rn=(e,t,r)=>t in e?En(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var R=(e,t,r)=>Rn(e,typeof t!="symbol"?t+"":t,r),Ct=(e,t,r)=>t.has(e)||Dt("Cannot "+r);var f=(e,t,r)=>(Ct(e,t,"read from private field"),r?r.call(e):t.get(e)),T=(e,t,r)=>t.has(e)?Dt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),E=(e,t,r,n)=>(Ct(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),L=(e,t,r)=>(Ct(e,t,"access private method"),r);var It=(e,t,r,n)=>({set _(s){E(e,t,s,r)},get _(){return f(e,t,n)}});var Mt=(e,t,r)=>(n,s)=>{let a=-1;return o(0);async function o(c){if(c<=a)throw new Error("next() called multiple times");a=c;let l,i=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&s||void 0,h)try{l=await h(n,()=>o(c+1))}catch(m){if(m instanceof Error&&t)n.error=m,l=await t(m,n),i=!0;else throw m}else n.finalized===!1&&r&&(l=await r(n));return l&&(n.finalized===!1||i)&&(n.res=l),n}},Sn=Symbol(),Cn=async(e,t=Object.create(null))=>{const{all:r=!1,dot:n=!1}=t,a=(e instanceof sn?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?On(e,{all:r,dot:n}):{}};async function On(e,t){const r=await e.formData();return r?kn(r,t):{}}function kn(e,t){const r=Object.create(null);return e.forEach((n,s)=>{t.all||s.endsWith("[]")?Tn(r,s,n):r[s]=n}),t.dot&&Object.entries(r).forEach(([n,s])=>{n.includes(".")&&(An(r,n,s),delete r[n])}),r}var Tn=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},An=(e,t,r)=>{let n=e;const s=t.split(".");s.forEach((a,o)=>{o===s.length-1?n[a]=r:((!n[a]||typeof n[a]!="object"||Array.isArray(n[a])||n[a]instanceof File)&&(n[a]=Object.create(null)),n=n[a])})},Zt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},jn=e=>{const{groups:t,path:r}=$n(e),n=Zt(r);return Nn(n,t)},$n=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,n)=>{const s=`@${n}`;return t.push([s,r]),s}),{groups:t,path:e}},Nn=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[n]=t[r];for(let s=e.length-1;s>=0;s--)if(e[s].includes(n)){e[s]=e[s].replace(n,t[r][1]);break}}return e},gt={},Dn=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const n=`${e}#${t}`;return gt[n]||(r[2]?gt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:gt[n]=[e,r[1],!0]),gt[n]}return null},jt=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},In=e=>jt(e,decodeURI),en=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let n=r;for(;n<t.length;n++){const s=t.charCodeAt(n);if(s===37){const a=t.indexOf("?",n),o=t.slice(r,a===-1?void 0:a);return In(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(s===63)break}return t.slice(r,n)},Mn=e=>{const t=en(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...r)=>(r.length&&(t=Ke(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tn=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let n="";return t.forEach(s=>{if(s!==""&&!/\:/.test(s))n+="/"+s;else if(/\:/.test(s))if(/\?/.test(s)){r.length===0&&n===""?r.push("/"):r.push(n);const a=s.replace("?","");n+="/"+a,r.push(n)}else n+="/"+s}),r.filter((s,a,o)=>o.indexOf(s)===a)},Ot=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?jt(e,rn):e):e,nn=(e,t,r)=>{let n;if(!r&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const c=e.charCodeAt(o+t.length+1);if(c===61){const l=o+t.length+2,i=e.indexOf("&",l);return Ot(e.slice(l,i===-1?void 0:i))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(n=/[%+]/.test(e),!n)return}const s={};n??(n=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const o=e.indexOf("&",a+1);let c=e.indexOf("=",a);c>o&&o!==-1&&(c=-1);let l=e.slice(a+1,c===-1?o===-1?void 0:o:c);if(n&&(l=Ot(l)),a=o,l==="")continue;let i;c===-1?i="":(i=e.slice(c+1,o===-1?void 0:o),n&&(i=Ot(i))),r?(s[l]&&Array.isArray(s[l])||(s[l]=[]),s[l].push(i)):s[l]??(s[l]=i)}return t?s[t]:s},Pn=nn,Fn=(e,t)=>nn(e,t,!0),rn=decodeURIComponent,Pt=e=>jt(e,rn),Qe,de,Ce,an,on,Tt,Te,Ut,sn=(Ut=class{constructor(e,t="/",r=[[]]){T(this,Ce);R(this,"raw");T(this,Qe);T(this,de);R(this,"routeIndex",0);R(this,"path");R(this,"bodyCache",{});T(this,Te,e=>{const{bodyCache:t,raw:r}=this,n=t[e];if(n)return n;const s=Object.keys(t)[0];return s?t[s].then(a=>(s==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,E(this,de,r),E(this,Qe,{})}param(e){return e?L(this,Ce,an).call(this,e):L(this,Ce,on).call(this)}query(e){return Pn(this.url,e)}queries(e){return Fn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,n)=>{t[n]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Cn(this,e))}json(){return f(this,Te).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,Te).call(this,"text")}arrayBuffer(){return f(this,Te).call(this,"arrayBuffer")}blob(){return f(this,Te).call(this,"blob")}formData(){return f(this,Te).call(this,"formData")}addValidatedData(e,t){f(this,Qe)[e]=t}valid(e){return f(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Sn](){return f(this,de)}get matchedRoutes(){return f(this,de)[0].map(([[,e]])=>e)}get routePath(){return f(this,de)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,de=new WeakMap,Ce=new WeakSet,an=function(e){const t=f(this,de)[0][this.routeIndex][1][e],r=L(this,Ce,Tt).call(this,t);return r&&/\%/.test(r)?Pt(r):r},on=function(){const e={},t=Object.keys(f(this,de)[0][this.routeIndex][1]);for(const r of t){const n=L(this,Ce,Tt).call(this,f(this,de)[0][this.routeIndex][1][r]);n!==void 0&&(e[r]=/\%/.test(n)?Pt(n):n)}return e},Tt=function(e){return f(this,de)[1]?f(this,de)[1][e]:e},Te=new WeakMap,Ut),Ln={Stringify:1},ln=async(e,t,r,n,s)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(s?s[0]+=e:s=[e],Promise.all(a.map(c=>c({phase:t,buffer:s,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>ln(l,t,!1,n,s))).then(()=>s[0]))):Promise.resolve(e)},qn="text/plain; charset=UTF-8",kt=(e,t)=>({"Content-Type":e,...t}),ut,dt,_e,Xe,Ee,se,ht,Ze,et,qe,ft,pt,Ae,Ye,Wt,Hn=(Wt=class{constructor(e,t){T(this,Ae);T(this,ut);T(this,dt);R(this,"env",{});T(this,_e);R(this,"finalized",!1);R(this,"error");T(this,Xe);T(this,Ee);T(this,se);T(this,ht);T(this,Ze);T(this,et);T(this,qe);T(this,ft);T(this,pt);R(this,"render",(...e)=>(f(this,Ze)??E(this,Ze,t=>this.html(t)),f(this,Ze).call(this,...e)));R(this,"setLayout",e=>E(this,ht,e));R(this,"getLayout",()=>f(this,ht));R(this,"setRenderer",e=>{E(this,Ze,e)});R(this,"header",(e,t,r)=>{this.finalized&&E(this,se,new Response(f(this,se).body,f(this,se)));const n=f(this,se)?f(this,se).headers:f(this,qe)??E(this,qe,new Headers);t===void 0?n.delete(e):r!=null&&r.append?n.append(e,t):n.set(e,t)});R(this,"status",e=>{E(this,Xe,e)});R(this,"set",(e,t)=>{f(this,_e)??E(this,_e,new Map),f(this,_e).set(e,t)});R(this,"get",e=>f(this,_e)?f(this,_e).get(e):void 0);R(this,"newResponse",(...e)=>L(this,Ae,Ye).call(this,...e));R(this,"body",(e,t,r)=>L(this,Ae,Ye).call(this,e,t,r));R(this,"text",(e,t,r)=>!f(this,qe)&&!f(this,Xe)&&!t&&!r&&!this.finalized?new Response(e):L(this,Ae,Ye).call(this,e,t,kt(qn,r)));R(this,"json",(e,t,r)=>L(this,Ae,Ye).call(this,JSON.stringify(e),t,kt("application/json",r)));R(this,"html",(e,t,r)=>{const n=s=>L(this,Ae,Ye).call(this,s,t,kt("text/html; charset=UTF-8",r));return typeof e=="object"?ln(e,Ln.Stringify,!1,{}).then(n):n(e)});R(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});R(this,"notFound",()=>(f(this,et)??E(this,et,()=>new Response),f(this,et).call(this,this)));E(this,ut,e),t&&(E(this,Ee,t.executionCtx),this.env=t.env,E(this,et,t.notFoundHandler),E(this,pt,t.path),E(this,ft,t.matchResult))}get req(){return f(this,dt)??E(this,dt,new sn(f(this,ut),f(this,pt),f(this,ft))),f(this,dt)}get event(){if(f(this,Ee)&&"respondWith"in f(this,Ee))return f(this,Ee);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,Ee))return f(this,Ee);throw Error("This context has no ExecutionContext")}get res(){return f(this,se)||E(this,se,new Response(null,{headers:f(this,qe)??E(this,qe,new Headers)}))}set res(e){if(f(this,se)&&e){e=new Response(e.body,e);for(const[t,r]of f(this,se).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=f(this,se).headers.getSetCookie();e.headers.delete("set-cookie");for(const s of n)e.headers.append("set-cookie",s)}else e.headers.set(t,r)}E(this,se,e),this.finalized=!0}get var(){return f(this,_e)?Object.fromEntries(f(this,_e)):{}}},ut=new WeakMap,dt=new WeakMap,_e=new WeakMap,Xe=new WeakMap,Ee=new WeakMap,se=new WeakMap,ht=new WeakMap,Ze=new WeakMap,et=new WeakMap,qe=new WeakMap,ft=new WeakMap,pt=new WeakMap,Ae=new WeakSet,Ye=function(e,t,r){const n=f(this,se)?new Headers(f(this,se).headers):f(this,qe)??new Headers;if(typeof t=="object"&&"headers"in t){const a=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,c]of a)o.toLowerCase()==="set-cookie"?n.append(o,c):n.set(o,c)}if(r)for(const[a,o]of Object.entries(r))if(typeof o=="string")n.set(a,o);else{n.delete(a);for(const c of o)n.append(a,c)}const s=typeof t=="number"?t:(t==null?void 0:t.status)??f(this,Xe);return new Response(e,{status:s,headers:n})},Wt),G="ALL",zn="all",Bn=["get","post","put","delete","options","patch"],cn="Can not add a route since the matcher is already built.",un=class extends Error{},Un="__COMPOSED_HANDLER",Wn=e=>e.text("404 Not Found",404),Ft=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},pe,Q,hn,me,Fe,yt,bt,Vt,dn=(Vt=class{constructor(t={}){T(this,Q);R(this,"get");R(this,"post");R(this,"put");R(this,"delete");R(this,"options");R(this,"patch");R(this,"all");R(this,"on");R(this,"use");R(this,"router");R(this,"getPath");R(this,"_basePath","/");T(this,pe,"/");R(this,"routes",[]);T(this,me,Wn);R(this,"errorHandler",Ft);R(this,"onError",t=>(this.errorHandler=t,this));R(this,"notFound",t=>(E(this,me,t),this));R(this,"fetch",(t,...r)=>L(this,Q,bt).call(this,t,r[1],r[0],t.method));R(this,"request",(t,r,n,s)=>t instanceof Request?this.fetch(r?new Request(t,r):t,n,s):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,r),n,s)));R(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(L(this,Q,bt).call(this,t.request,t,void 0,t.request.method))})});[...Bn,zn].forEach(a=>{this[a]=(o,...c)=>(typeof o=="string"?E(this,pe,o):L(this,Q,Fe).call(this,a,f(this,pe),o),c.forEach(l=>{L(this,Q,Fe).call(this,a,f(this,pe),l)}),this)}),this.on=(a,o,...c)=>{for(const l of[o].flat()){E(this,pe,l);for(const i of[a].flat())c.map(h=>{L(this,Q,Fe).call(this,i.toUpperCase(),f(this,pe),h)})}return this},this.use=(a,...o)=>(typeof a=="string"?E(this,pe,a):(E(this,pe,"*"),o.unshift(a)),o.forEach(c=>{L(this,Q,Fe).call(this,G,f(this,pe),c)}),this);const{strict:n,...s}=t;Object.assign(this,s),this.getPath=n??!0?t.getPath??en:Mn}route(t,r){const n=this.basePath(t);return r.routes.map(s=>{var o;let a;r.errorHandler===Ft?a=s.handler:(a=async(c,l)=>(await Mt([],r.errorHandler)(c,()=>s.handler(c,l))).res,a[Un]=s.handler),L(o=n,Q,Fe).call(o,s.method,s.path,a)}),this}basePath(t){const r=L(this,Q,hn).call(this);return r._basePath=Ke(this._basePath,t),r}mount(t,r,n){let s,a;n&&(typeof n=="function"?a=n:(a=n.optionHandler,n.replaceRequest===!1?s=l=>l:s=n.replaceRequest));const o=a?l=>{const i=a(l);return Array.isArray(i)?i:[i]}:l=>{let i;try{i=l.executionCtx}catch{}return[l.env,i]};s||(s=(()=>{const l=Ke(this._basePath,t),i=l==="/"?0:l.length;return h=>{const m=new URL(h.url);return m.pathname=m.pathname.slice(i)||"/",new Request(m,h)}})());const c=async(l,i)=>{const h=await r(s(l.req.raw),...o(l));if(h)return h;await i()};return L(this,Q,Fe).call(this,G,Ke(t,"*"),c),this}},pe=new WeakMap,Q=new WeakSet,hn=function(){const t=new dn({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,E(t,me,f(this,me)),t.routes=this.routes,t},me=new WeakMap,Fe=function(t,r,n){t=t.toUpperCase(),r=Ke(this._basePath,r);const s={basePath:this._basePath,path:r,method:t,handler:n};this.router.add(t,r,[n,s]),this.routes.push(s)},yt=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},bt=function(t,r,n,s){if(s==="HEAD")return(async()=>new Response(null,await L(this,Q,bt).call(this,t,r,n,"GET")))();const a=this.getPath(t,{env:n}),o=this.router.match(s,a),c=new Hn(t,{path:a,matchResult:o,env:n,executionCtx:r,notFoundHandler:f(this,me)});if(o[0].length===1){let i;try{i=o[0][0][0][0](c,async()=>{c.res=await f(this,me).call(this,c)})}catch(h){return L(this,Q,yt).call(this,h,c)}return i instanceof Promise?i.then(h=>h||(c.finalized?c.res:f(this,me).call(this,c))).catch(h=>L(this,Q,yt).call(this,h,c)):i??f(this,me).call(this,c)}const l=Mt(o[0],this.errorHandler,f(this,me));return(async()=>{try{const i=await l(c);if(!i.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return i.res}catch(i){return L(this,Q,yt).call(this,i,c)}})()},Vt),fn=[];function Vn(e,t){const r=this.buildAllMatchers(),n=(s,a)=>{const o=r[s]||r[G],c=o[2][a];if(c)return c;const l=a.match(o[0]);if(!l)return[[],fn];const i=l.indexOf("",1);return[o[1][i],l]};return this.match=n,n(e,t)}var wt="[^/]+",ot=".*",lt="(?:|/.*)",Ge=Symbol(),Jn=new Set(".\\+*[^]$()");function Kn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===ot||e===lt?1:t===ot||t===lt?-1:e===wt?1:t===wt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,ze,ge,Jt,At=(Jt=class{constructor(){T(this,He);T(this,ze);T(this,ge,Object.create(null))}insert(t,r,n,s,a){if(t.length===0){if(f(this,He)!==void 0)throw Ge;if(a)return;E(this,He,r);return}const[o,...c]=t,l=o==="*"?c.length===0?["","",ot]:["","",wt]:o==="/*"?["","",lt]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let i;if(l){const h=l[1];let m=l[2]||wt;if(h&&l[2]&&(m===".*"||(m=m.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(m))))throw Ge;if(i=f(this,ge)[m],!i){if(Object.keys(f(this,ge)).some(g=>g!==ot&&g!==lt))throw Ge;if(a)return;i=f(this,ge)[m]=new At,h!==""&&E(i,ze,s.varIndex++)}!a&&h!==""&&n.push([h,f(i,ze)])}else if(i=f(this,ge)[o],!i){if(Object.keys(f(this,ge)).some(h=>h.length>1&&h!==ot&&h!==lt))throw Ge;if(a)return;i=f(this,ge)[o]=new At}i.insert(c,r,n,s,a)}buildRegExpStr(){const r=Object.keys(f(this,ge)).sort(Kn).map(n=>{const s=f(this,ge)[n];return(typeof f(s,ze)=="number"?`(${n})@${f(s,ze)}`:Jn.has(n)?`\\${n}`:n)+s.buildRegExpStr()});return typeof f(this,He)=="number"&&r.unshift(`#${f(this,He)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},He=new WeakMap,ze=new WeakMap,ge=new WeakMap,Jt),_t,mt,Kt,Yn=(Kt=class{constructor(){T(this,_t,{varIndex:0});T(this,mt,new At)}insert(e,t,r){const n=[],s=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const i=`@\\${o}`;return s[o]=[i,l],o++,c=!0,i}),!c)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=s.length-1;o>=0;o--){const[c]=s[o];for(let l=a.length-1;l>=0;l--)if(a[l].indexOf(c)!==-1){a[l]=a[l].replace(c,s[o][1]);break}}return f(this,mt).insert(a,t,n,f(this,_t),r),n}buildRegExp(){let e=f(this,mt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(s,a,o)=>a!==void 0?(r[++t]=Number(a),"$()"):(o!==void 0&&(n[Number(o)]=++t),"")),[new RegExp(`^${e}`),r,n]}},_t=new WeakMap,mt=new WeakMap,Kt),Gn=[/^$/,[],Object.create(null)],vt=Object.create(null);function pn(e){return vt[e]??(vt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Qn(){vt=Object.create(null)}function Xn(e){var i;const t=new Yn,r=[];if(e.length===0)return Gn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,m],[g,y])=>h?1:g?-1:m.length-y.length),s=Object.create(null);for(let h=0,m=-1,g=n.length;h<g;h++){const[y,x,_]=n[h];y?s[x]=[_.map(([$])=>[$,Object.create(null)]),fn]:m++;let M;try{M=t.insert(x,m,y)}catch($){throw $===Ge?new un(x):$}y||(r[m]=_.map(([$,ie])=>{const Oe=Object.create(null);for(ie-=1;ie>=0;ie--){const[oe,Pe]=M[ie];Oe[oe]=Pe}return[$,Oe]}))}const[a,o,c]=t.buildRegExp();for(let h=0,m=r.length;h<m;h++)for(let g=0,y=r[h].length;g<y;g++){const x=(i=r[h][g])==null?void 0:i[1];if(!x)continue;const _=Object.keys(x);for(let M=0,$=_.length;M<$;M++)x[_[M]]=c[x[_[M]]]}const l=[];for(const h in o)l[h]=r[o[h]];return[a,l,s]}function Je(e,t){if(e){for(const r of Object.keys(e).sort((n,s)=>s.length-n.length))if(pn(r).test(t))return[...e[r]]}}var je,$e,Et,mn,Yt,Zn=(Yt=class{constructor(){T(this,Et);R(this,"name","RegExpRouter");T(this,je);T(this,$e);R(this,"match",Vn);E(this,je,{[G]:Object.create(null)}),E(this,$e,{[G]:Object.create(null)})}add(e,t,r){var c;const n=f(this,je),s=f(this,$e);if(!n||!s)throw new Error(cn);n[e]||[n,s].forEach(l=>{l[e]=Object.create(null),Object.keys(l[G]).forEach(i=>{l[e][i]=[...l[G][i]]})}),t==="/*"&&(t="*");const a=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=pn(t);e===G?Object.keys(n).forEach(i=>{var h;(h=n[i])[t]||(h[t]=Je(n[i],t)||Je(n[G],t)||[])}):(c=n[e])[t]||(c[t]=Je(n[e],t)||Je(n[G],t)||[]),Object.keys(n).forEach(i=>{(e===G||e===i)&&Object.keys(n[i]).forEach(h=>{l.test(h)&&n[i][h].push([r,a])})}),Object.keys(s).forEach(i=>{(e===G||e===i)&&Object.keys(s[i]).forEach(h=>l.test(h)&&s[i][h].push([r,a]))});return}const o=tn(t)||[t];for(let l=0,i=o.length;l<i;l++){const h=o[l];Object.keys(s).forEach(m=>{var g;(e===G||e===m)&&((g=s[m])[h]||(g[h]=[...Je(n[m],h)||Je(n[G],h)||[]]),s[m][h].push([r,a-i+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(f(this,$e)).concat(Object.keys(f(this,je))).forEach(t=>{e[t]||(e[t]=L(this,Et,mn).call(this,t))}),E(this,je,E(this,$e,void 0)),Qn(),e}},je=new WeakMap,$e=new WeakMap,Et=new WeakSet,mn=function(e){const t=[];let r=e===G;return[f(this,je),f(this,$e)].forEach(n=>{const s=n[e]?Object.keys(n[e]).map(a=>[a,n[e][a]]):[];s.length!==0?(r||(r=!0),t.push(...s)):e!==G&&t.push(...Object.keys(n[G]).map(a=>[a,n[G][a]]))}),r?Xn(t):null},Yt),Ne,Re,Gt,er=(Gt=class{constructor(e){R(this,"name","SmartRouter");T(this,Ne,[]);T(this,Re,[]);E(this,Ne,e.routers)}add(e,t,r){if(!f(this,Re))throw new Error(cn);f(this,Re).push([e,t,r])}match(e,t){if(!f(this,Re))throw new Error("Fatal error");const r=f(this,Ne),n=f(this,Re),s=r.length;let a=0,o;for(;a<s;a++){const c=r[a];try{for(let l=0,i=n.length;l<i;l++)c.add(...n[l]);o=c.match(e,t)}catch(l){if(l instanceof un)continue;throw l}this.match=c.match.bind(c),E(this,Ne,[c]),E(this,Re,void 0);break}if(a===s)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(f(this,Re)||f(this,Ne).length!==1)throw new Error("No active router has been determined yet.");return f(this,Ne)[0]}},Ne=new WeakMap,Re=new WeakMap,Gt),at=Object.create(null),De,re,Be,tt,ee,Se,Le,Qt,gn=(Qt=class{constructor(e,t,r){T(this,Se);T(this,De);T(this,re);T(this,Be);T(this,tt,0);T(this,ee,at);if(E(this,re,r||Object.create(null)),E(this,De,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},E(this,De,[n])}E(this,Be,[])}insert(e,t,r){E(this,tt,++It(this,tt)._);let n=this;const s=jn(t),a=[];for(let o=0,c=s.length;o<c;o++){const l=s[o],i=s[o+1],h=Dn(l,i),m=Array.isArray(h)?h[0]:l;if(m in f(n,re)){n=f(n,re)[m],h&&a.push(h[1]);continue}f(n,re)[m]=new gn,h&&(f(n,Be).push(h),a.push(h[1])),n=f(n,re)[m]}return f(n,De).push({[e]:{handler:r,possibleKeys:a.filter((o,c,l)=>l.indexOf(o)===c),score:f(this,tt)}}),n}search(e,t){var c;const r=[];E(this,ee,at);let s=[this];const a=Zt(t),o=[];for(let l=0,i=a.length;l<i;l++){const h=a[l],m=l===i-1,g=[];for(let y=0,x=s.length;y<x;y++){const _=s[y],M=f(_,re)[h];M&&(E(M,ee,f(_,ee)),m?(f(M,re)["*"]&&r.push(...L(this,Se,Le).call(this,f(M,re)["*"],e,f(_,ee))),r.push(...L(this,Se,Le).call(this,M,e,f(_,ee)))):g.push(M));for(let $=0,ie=f(_,Be).length;$<ie;$++){const Oe=f(_,Be)[$],oe=f(_,ee)===at?{}:{...f(_,ee)};if(Oe==="*"){const p=f(_,re)["*"];p&&(r.push(...L(this,Se,Le).call(this,p,e,f(_,ee))),E(p,ee,oe),g.push(p));continue}const[Pe,he,P]=Oe;if(!h&&!(P instanceof RegExp))continue;const u=f(_,re)[Pe],d=a.slice(l).join("/");if(P instanceof RegExp){const p=P.exec(d);if(p){if(oe[he]=p[0],r.push(...L(this,Se,Le).call(this,u,e,f(_,ee),oe)),Object.keys(f(u,re)).length){E(u,ee,oe);const b=((c=p[0].match(/\//))==null?void 0:c.length)??0;(o[b]||(o[b]=[])).push(u)}continue}}(P===!0||P.test(h))&&(oe[he]=h,m?(r.push(...L(this,Se,Le).call(this,u,e,oe,f(_,ee))),f(u,re)["*"]&&r.push(...L(this,Se,Le).call(this,f(u,re)["*"],e,oe,f(_,ee)))):(E(u,ee,oe),g.push(u)))}}s=g.concat(o.shift()??[])}return r.length>1&&r.sort((l,i)=>l.score-i.score),[r.map(({handler:l,params:i})=>[l,i])]}},De=new WeakMap,re=new WeakMap,Be=new WeakMap,tt=new WeakMap,ee=new WeakMap,Se=new WeakSet,Le=function(e,t,r,n){const s=[];for(let a=0,o=f(e,De).length;a<o;a++){const c=f(e,De)[a],l=c[t]||c[G],i={};if(l!==void 0&&(l.params=Object.create(null),s.push(l),r!==at||n&&n!==at))for(let h=0,m=l.possibleKeys.length;h<m;h++){const g=l.possibleKeys[h],y=i[l.score];l.params[g]=n!=null&&n[g]&&!y?n[g]:r[g]??(n==null?void 0:n[g]),i[l.score]=!0}}return s},Qt),Ue,Xt,tr=(Xt=class{constructor(){R(this,"name","TrieRouter");T(this,Ue);E(this,Ue,new gn)}add(e,t,r){const n=tn(t);if(n){for(let s=0,a=n.length;s<a;s++)f(this,Ue).insert(e,n[s],r);return}f(this,Ue).insert(e,t,r)}match(e,t){return f(this,Ue).search(e,t)}},Ue=new WeakMap,Xt),Me=class extends dn{constructor(e={}){super(e),this.router=e.router??new er({routers:[new Zn,new tr]})}},nr=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(a=>typeof a=="string"?a==="*"?()=>a:o=>a===o?o:null:typeof a=="function"?a:o=>a.includes(o)?o:null)(r.origin),s=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(r.allowMethods);return async function(o,c){var h;function l(m,g){o.res.headers.set(m,g)}const i=await n(o.req.header("origin")||"",o);if(i&&l("Access-Control-Allow-Origin",i),r.origin!=="*"){const m=o.req.header("Vary");m?l("Vary",m):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),o.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const m=await s(o.req.header("origin")||"",o);m.length&&l("Access-Control-Allow-Methods",m.join(","));let g=r.allowHeaders;if(!(g!=null&&g.length)){const y=o.req.header("Access-Control-Request-Headers");y&&(g=y.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c()}},rr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Lt=(e,t=ar)=>{const r=/\.([a-zA-Z0-9]+?)$/,n=e.match(r);if(!n)return;let s=t[n[1]];return s&&s.startsWith("text")&&(s+="; charset=utf-8"),s},sr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ar=sr,ir=(...e)=>{let t=e.filter(s=>s!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),n=[];for(const s of r)s===".."&&n.length>0&&n.at(-1)!==".."?n.pop():s!=="."&&n.push(s);return n.join("/")||"."},yn={br:".br",zstd:".zst",gzip:".gz"},or=Object.keys(yn),lr="index.html",cr=e=>{const t=e.root??"./",r=e.path,n=e.join??ir;return async(s,a)=>{var h,m,g,y;if(s.finalized)return a();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(s.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,s.req.path,s)),a()}let c=n(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=n(c,lr));const l=e.getContent;let i=await l(c,s);if(i instanceof Response)return s.newResponse(i.body,i);if(i){const x=e.mimes&&Lt(c,e.mimes)||Lt(c);if(s.header("Content-Type",x||"application/octet-stream"),e.precompressed&&(!x||rr.test(x))){const _=new Set((m=s.req.header("Accept-Encoding"))==null?void 0:m.split(",").map(M=>M.trim()));for(const M of or){if(!_.has(M))continue;const $=await l(c+yn[M],s);if($){i=$,s.header("Content-Encoding",M),s.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,s)),s.body(i)}await((y=e.onNotFound)==null?void 0:y.call(e,c,s)),await a()}},ur=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const s=r[e]||e;if(!s)return null;const a=await n.get(s,{type:"stream"});return a||null},dr=e=>async function(r,n){return cr({...e,getContent:async a=>ur(a,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,n)},hr=e=>dr(e);function fr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var xt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var pr=xt.exports,qt;function mr(){return qt||(qt=1,(function(e,t){((r,n)=>{e.exports=n()})(pr,function r(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},s,a=!n.document&&!!n.postMessage,o=n.IS_PAPA_WORKER||!1,c={},l=0,i={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var p=Pe(d);p.chunkSize=parseInt(p.chunkSize),d.step||d.chunk||(p.chunkSize=null),this._handle=new _(p),(this._handle.streamer=this)._config=p}).call(this,u),this.parseChunk=function(d,p){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let A=this._config.newline;A||(v=this._config.quoteChar||'"',A=this._handle.guessLineEndings(d,v)),d=[...d.split(A).slice(b)].join(A)}this.isFirstChunk&&P(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),o)n.postMessage({results:v,workerId:i.WORKER_ID,finished:b});else if(P(this._config.chunk)&&!p){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!P(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){P(this._config.error)?this._config.error(d):o&&this._config.error&&n.postMessage({workerId:i.WORKER_ID,error:d,finished:!1})}}function m(u){var d;(u=u||{}).chunkSize||(u.chunkSize=i.RemoteChunkSize),h.call(this,u),this._nextChunk=a?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(p){this._input=p,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),a||(d.onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!a),this._config.downloadRequestHeaders){var p,b=this._config.downloadRequestHeaders;for(p in b)d.setRequestHeader(p,b[p])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(A){this._chunkError(A.message)}a&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(p=>(p=p.getResponseHeader("Content-Range"))!==null?parseInt(p.substring(p.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(p){p=d.statusText||p,this._sendError(new Error(p))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=i.LocalChunkSize),h.call(this,u);var d,p,b=typeof FileReader<"u";this.stream=function(v){this._input=v,p=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,A=(this._config.chunkSize&&(A=Math.min(this._start+this._config.chunkSize,this._input.size),v=p.call(v,this._start,A)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:A}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(p){return d=p,this._nextChunk()},this._nextChunk=function(){var p,b;if(!this._finished)return p=this._config.chunkSize,d=p?(b=d.substring(0,p),d.substring(p)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function x(u){h.call(this,u=u||{});var d=[],p=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):p=!0},this._streamData=he(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),p&&(p=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(A){this._streamError(A)}},this),this._streamError=he(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=he(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=he(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function _(u){var d,p,b,v,A=Math.pow(2,53),J=-A,le=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ce=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,j=this,B=0,S=0,te=!1,O=!1,N=[],w={data:[],errors:[],meta:{}};function K(D){return u.skipEmptyLines==="greedy"?D.join("").trim()==="":D.length===1&&D[0].length===0}function V(){if(w&&b&&(ue("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+i.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(w.data=w.data.filter(function(C){return!K(C)})),Z()){let C=function(W,Y){P(u.transformHeader)&&(W=u.transformHeader(W,Y)),N.push(W)};if(w)if(Array.isArray(w.data[0])){for(var D=0;Z()&&D<w.data.length;D++)w.data[D].forEach(C);w.data.splice(0,1)}else w.data.forEach(C)}function F(C,W){for(var Y=u.header?{}:[],q=0;q<C.length;q++){var H=q,I=C[q],I=((fe,k)=>(z=>(u.dynamicTypingFunction&&u.dynamicTyping[z]===void 0&&(u.dynamicTyping[z]=u.dynamicTypingFunction(z)),(u.dynamicTyping[z]||u.dynamicTyping)===!0))(fe)?k==="true"||k==="TRUE"||k!=="false"&&k!=="FALSE"&&((z=>{if(le.test(z)&&(z=parseFloat(z),J<z&&z<A))return 1})(k)?parseFloat(k):ce.test(k)?new Date(k):k===""?null:k):k)(H=u.header?q>=N.length?"__parsed_extra":N[q]:H,I=u.transform?u.transform(I,H):I);H==="__parsed_extra"?(Y[H]=Y[H]||[],Y[H].push(I)):Y[H]=I}return u.header&&(q>N.length?ue("FieldMismatch","TooManyFields","Too many fields: expected "+N.length+" fields but parsed "+q,S+W):q<N.length&&ue("FieldMismatch","TooFewFields","Too few fields: expected "+N.length+" fields but parsed "+q,S+W)),Y}var U;w&&(u.header||u.dynamicTyping||u.transform)&&(U=1,!w.data.length||Array.isArray(w.data[0])?(w.data=w.data.map(F),U=w.data.length):w.data=F(w.data,0),u.header&&w.meta&&(w.meta.fields=N),S+=U)}function Z(){return u.header&&N.length===0}function ue(D,F,U,C){D={type:D,code:F,message:U},C!==void 0&&(D.row=C),w.errors.push(D)}P(u.step)&&(v=u.step,u.step=function(D){w=D,Z()?V():(V(),w.data.length!==0&&(B+=D.data.length,u.preview&&B>u.preview?p.abort():(w.data=w.data[0],v(w,j))))}),this.parse=function(D,F,U){var C=u.quoteChar||'"',C=(u.newline||(u.newline=this.guessLineEndings(D,C)),b=!1,u.delimiter?P(u.delimiter)&&(u.delimiter=u.delimiter(D),w.meta.delimiter=u.delimiter):((C=((W,Y,q,H,I)=>{var fe,k,z,ke;I=I||[",","	","|",";",i.RECORD_SEP,i.UNIT_SEP];for(var We=0;We<I.length;We++){for(var be,rt=I[We],ne=0,ve=0,X=0,ae=(z=void 0,new $({comments:H,delimiter:rt,newline:Y,preview:10}).parse(W)),we=0;we<ae.data.length;we++)q&&K(ae.data[we])?X++:(be=ae.data[we].length,ve+=be,z===void 0?z=be:0<be&&(ne+=Math.abs(be-z),z=be));0<ae.data.length&&(ve/=ae.data.length-X),(k===void 0||ne<=k)&&(ke===void 0||ke<ve)&&1.99<ve&&(k=ne,fe=rt,ke=ve)}return{successful:!!(u.delimiter=fe),bestDelimiter:fe}})(D,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=C.bestDelimiter:(b=!0,u.delimiter=i.DefaultDelimiter),w.meta.delimiter=u.delimiter),Pe(u));return u.preview&&u.header&&C.preview++,d=D,p=new $(C),w=p.parse(d,F,U),V(),te?{meta:{paused:!0}}:w||{meta:{paused:!1}}},this.paused=function(){return te},this.pause=function(){te=!0,p.abort(),d=P(u.chunk)?"":d.substring(p.getCharIndex())},this.resume=function(){j.streamer._halted?(te=!1,j.streamer.parseChunk(d,!0)):setTimeout(j.resume,3)},this.aborted=function(){return O},this.abort=function(){O=!0,p.abort(),w.meta.aborted=!0,P(u.complete)&&u.complete(w),d=""},this.guessLineEndings=function(W,C){W=W.substring(0,1048576);var C=new RegExp(M(C)+"([^]*?)"+M(C),"gm"),U=(W=W.replace(C,"")).split("\r"),C=W.split(`
`),W=1<C.length&&C[0].length<U[0].length;if(U.length===1||W)return`
`;for(var Y=0,q=0;q<U.length;q++)U[q][0]===`
`&&Y++;return Y>=U.length/2?`\r
`:"\r"}}function M(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function $(u){var d=(u=u||{}).delimiter,p=u.newline,b=u.comments,v=u.step,A=u.preview,J=u.fastMode,le=null,ce=!1,j=u.quoteChar==null?'"':u.quoteChar,B=j;if(u.escapeChar!==void 0&&(B=u.escapeChar),(typeof d!="string"||-1<i.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<i.BAD_DELIMITERS.indexOf(b))&&(b=!1),p!==`
`&&p!=="\r"&&p!==`\r
`&&(p=`
`);var S=0,te=!1;this.parse=function(O,N,w){if(typeof O!="string")throw new Error("Input must be a string");var K=O.length,V=d.length,Z=p.length,ue=b.length,D=P(v),F=[],U=[],C=[],W=S=0;if(!O)return ne();if(J||J!==!1&&O.indexOf(j)===-1){for(var Y=O.split(p),q=0;q<Y.length;q++){if(C=Y[q],S+=C.length,q!==Y.length-1)S+=p.length;else if(w)return ne();if(!b||C.substring(0,ue)!==b){if(D){if(F=[],ke(C.split(d)),ve(),te)return ne()}else ke(C.split(d));if(A&&A<=q)return F=F.slice(0,A),ne(!0)}}return ne()}for(var H=O.indexOf(d,S),I=O.indexOf(p,S),fe=new RegExp(M(B)+M(j),"g"),k=O.indexOf(j,S);;)if(O[S]===j)for(k=S,S++;;){if((k=O.indexOf(j,k+1))===-1)return w||U.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:F.length,index:S}),be();if(k===K-1)return be(O.substring(S,k).replace(fe,j));if(j===B&&O[k+1]===B)k++;else if(j===B||k===0||O[k-1]!==B){H!==-1&&H<k+1&&(H=O.indexOf(d,k+1));var z=We((I=I!==-1&&I<k+1?O.indexOf(p,k+1):I)===-1?H:Math.min(H,I));if(O.substr(k+1+z,V)===d){C.push(O.substring(S,k).replace(fe,j)),O[S=k+1+z+V]!==j&&(k=O.indexOf(j,S)),H=O.indexOf(d,S),I=O.indexOf(p,S);break}if(z=We(I),O.substring(k+1+z,k+1+z+Z)===p){if(C.push(O.substring(S,k).replace(fe,j)),rt(k+1+z+Z),H=O.indexOf(d,S),k=O.indexOf(j,S),D&&(ve(),te))return ne();if(A&&F.length>=A)return ne(!0);break}U.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:F.length,index:S}),k++}}else if(b&&C.length===0&&O.substring(S,S+ue)===b){if(I===-1)return ne();S=I+Z,I=O.indexOf(p,S),H=O.indexOf(d,S)}else if(H!==-1&&(H<I||I===-1))C.push(O.substring(S,H)),S=H+V,H=O.indexOf(d,S);else{if(I===-1)break;if(C.push(O.substring(S,I)),rt(I+Z),D&&(ve(),te))return ne();if(A&&F.length>=A)return ne(!0)}return be();function ke(X){F.push(X),W=S}function We(X){var ae=0;return ae=X!==-1&&(X=O.substring(k+1,X))&&X.trim()===""?X.length:ae}function be(X){return w||(X===void 0&&(X=O.substring(S)),C.push(X),S=K,ke(C),D&&ve()),ne()}function rt(X){S=X,ke(C),C=[],I=O.indexOf(p,S)}function ne(X){if(u.header&&!N&&F.length&&!ce){var ae=F[0],we=Object.create(null),St=new Set(ae);let $t=!1;for(let Ve=0;Ve<ae.length;Ve++){let xe=ae[Ve];if(we[xe=P(u.transformHeader)?u.transformHeader(xe,Ve):xe]){let st,Nt=we[xe];for(;st=xe+"_"+Nt,Nt++,St.has(st););St.add(st),ae[Ve]=st,we[xe]++,$t=!0,(le=le===null?{}:le)[st]=xe}else we[xe]=1,ae[Ve]=xe;St.add(xe)}$t&&console.warn("Duplicate headers found and renamed."),ce=!0}return{data:F,errors:U,meta:{delimiter:d,linebreak:p,aborted:te,truncated:!!X,cursor:W+(N||0),renamedHeaders:le}}}function ve(){v(ne()),F=[],U=[]}},this.abort=function(){te=!0},this.getCharIndex=function(){return S}}function ie(u){var d=u.data,p=c[d.workerId],b=!1;if(d.error)p.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,Oe(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:oe,resume:oe};if(P(p.userStep)){for(var A=0;A<d.results.data.length&&(p.userStep({data:d.results.data[A],errors:d.results.errors,meta:d.results.meta},v),!b);A++);delete d.results}else P(p.userChunk)&&(p.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&Oe(d.workerId,d.results)}function Oe(u,d){var p=c[u];P(p.userComplete)&&p.userComplete(d),p.terminate(),delete c[u]}function oe(){throw new Error("Not implemented.")}function Pe(u){if(typeof u!="object"||u===null)return u;var d,p=Array.isArray(u)?[]:{};for(d in u)p[d]=Pe(u[d]);return p}function he(u,d){return function(){u.apply(d,arguments)}}function P(u){return typeof u=="function"}return i.parse=function(u,d){var p=(d=d||{}).dynamicTyping||!1;if(P(p)&&(d.dynamicTypingFunction=p,p={}),d.dynamicTyping=p,d.transform=!!P(d.transform)&&d.transform,!d.worker||!i.WORKERS_SUPPORTED)return p=null,i.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),p=new(d.download?m:y)(d)):u.readable===!0&&P(u.read)&&P(u.on)?p=new x(d):(n.File&&u instanceof File||u instanceof Object)&&(p=new g(d)),p.stream(u);(p=(()=>{var b;return!!i.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,A=r.toString();return i.BLOB_URL||(i.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",A,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=ie,b.id=l++,c[b.id]=b)})()).userStep=d.step,p.userChunk=d.chunk,p.userComplete=d.complete,p.userError=d.error,d.step=P(d.step),d.chunk=P(d.chunk),d.complete=P(d.complete),d.error=P(d.error),delete d.worker,p.postMessage({input:u,config:d,workerId:p.id})},i.unparse=function(u,d){var p=!1,b=!0,v=",",A=`\r
`,J='"',le=J+J,ce=!1,j=null,B=!1,S=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||i.BAD_DELIMITERS.filter(function(N){return d.delimiter.indexOf(N)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(p=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(ce=d.skipEmptyLines),typeof d.newline=="string"&&(A=d.newline),typeof d.quoteChar=="string"&&(J=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");j=d.columns}d.escapeChar!==void 0&&(le=d.escapeChar+J),d.escapeFormulae instanceof RegExp?B=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(B=/^[=+\-@\t\r].*$/)}})(),new RegExp(M(J),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return te(null,u,ce);if(typeof u[0]=="object")return te(j||Object.keys(u[0]),u,ce)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||j),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),te(u.fields||[],u.data||[],ce);throw new Error("Unable to serialize unrecognized input");function te(N,w,K){var V="",Z=(typeof N=="string"&&(N=JSON.parse(N)),typeof w=="string"&&(w=JSON.parse(w)),Array.isArray(N)&&0<N.length),ue=!Array.isArray(w[0]);if(Z&&b){for(var D=0;D<N.length;D++)0<D&&(V+=v),V+=O(N[D],D);0<w.length&&(V+=A)}for(var F=0;F<w.length;F++){var U=(Z?N:w[F]).length,C=!1,W=Z?Object.keys(w[F]).length===0:w[F].length===0;if(K&&!Z&&(C=K==="greedy"?w[F].join("").trim()==="":w[F].length===1&&w[F][0].length===0),K==="greedy"&&Z){for(var Y=[],q=0;q<U;q++){var H=ue?N[q]:q;Y.push(w[F][H])}C=Y.join("").trim()===""}if(!C){for(var I=0;I<U;I++){0<I&&!W&&(V+=v);var fe=Z&&ue?N[I]:I;V+=O(w[F][fe],I)}F<w.length-1&&(!K||0<U&&!W)&&(V+=A)}}return V}function O(N,w){var K,V;return N==null?"":N.constructor===Date?JSON.stringify(N).slice(1,25):(V=!1,B&&typeof N=="string"&&B.test(N)&&(N="'"+N,V=!0),K=N.toString().replace(S,le),(V=V||p===!0||typeof p=="function"&&p(N,w)||Array.isArray(p)&&p[w]||((Z,ue)=>{for(var D=0;D<ue.length;D++)if(-1<Z.indexOf(ue[D]))return!0;return!1})(K,i.BAD_DELIMITERS)||-1<K.indexOf(v)||K.charAt(0)===" "||K.charAt(K.length-1)===" ")?J+K+J:K)}},i.RECORD_SEP="",i.UNIT_SEP="",i.BYTE_ORDER_MARK="\uFEFF",i.BAD_DELIMITERS=["\r",`
`,'"',i.BYTE_ORDER_MARK],i.WORKERS_SUPPORTED=!a&&!!n.Worker,i.NODE_STREAM_INPUT=1,i.LocalChunkSize=10485760,i.RemoteChunkSize=5242880,i.DefaultDelimiter=",",i.Parser=$,i.ParserHandle=_,i.NetworkStreamer=m,i.FileStreamer=g,i.StringStreamer=y,i.ReadableStreamStreamer=x,n.jQuery&&((s=n.jQuery).fn.parse=function(u){var d=u.config||{},p=[];return this.each(function(A){if(!(s(this).prop("tagName").toUpperCase()==="INPUT"&&s(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var J=0;J<this.files.length;J++)p.push({file:this.files[J],inputElem:this,instanceConfig:s.extend({},d)})}),b(),this;function b(){if(p.length===0)P(u.complete)&&u.complete();else{var A,J,le,ce,j=p[0];if(P(u.before)){var B=u.before(j.file,j.inputElem);if(typeof B=="object"){if(B.action==="abort")return A="AbortError",J=j.file,le=j.inputElem,ce=B.reason,void(P(u.error)&&u.error({name:A},J,le,ce));if(B.action==="skip")return void v();typeof B.config=="object"&&(j.instanceConfig=s.extend(j.instanceConfig,B.config))}else if(B==="skip")return void v()}var S=j.instanceConfig.complete;j.instanceConfig.complete=function(te){P(S)&&S(te,j.file,j.inputElem),v()},i.parse(j.file,j.instanceConfig)}}function v(){p.splice(0,1),b()}}),o&&(n.onmessage=function(u){u=u.data,i.WORKER_ID===void 0&&u&&(i.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:i.WORKER_ID,results:i.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=i.parse(u.input,u.config))&&n.postMessage({workerId:i.WORKER_ID,results:u,finished:!0})}),(m.prototype=Object.create(h.prototype)).constructor=m,(g.prototype=Object.create(h.prototype)).constructor=g,(y.prototype=Object.create(y.prototype)).constructor=y,(x.prototype=Object.create(h.prototype)).constructor=x,i})})(xt)),xt.exports}var gr=mr();const yr=fr(gr);function br(e,t={}){const{maxRows:r=1e4}=t,n=yr.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:s=>s.trim(),preview:r});return n.errors.length>0&&console.warn("CSV parsing warnings:",n.errors.slice(0,5)),n.data}function vr(e){if(e.length===0)return{};const t=Object.keys(e[0]),r={};for(const n of t){const s=e.slice(0,Math.min(100,e.length)).map(a=>a[n]);r[n]=xr(s)}return r}function xr(e){const t=e.filter(a=>a!=null&&a!=="");if(t.length===0)return"string";if(t.filter(a=>typeof a=="number"&&!isNaN(a)).length===t.length)return"number";if(t.filter(a=>typeof a=="boolean").length===t.length)return"boolean";const s=t.filter(a=>{if(typeof a=="string"){const o=Date.parse(a);return!isNaN(o)}return!1}).length;return s===t.length&&s>0?"date":"string"}function wr(e,t){const r=[];for(const n of e){const s=n.name.toLowerCase();if(!((s.endsWith("id")||s.endsWith("_id")||s==="id")&&n.type==="number"))continue;const o=n.name.replace(/[_-]?id$/i,""),c=[`${o}Name`,`${o}_name`,`${o}name`,`${o.toLowerCase()}name`,`${o}`];for(const l of c){const i=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(i){const h=n.unique_count/t,m=i.unique_count/t;let g=.5;Math.abs(h-m)<.2?g=.9:Math.abs(h-m)<.4&&(g=.7),r.push({id_column:n.name,name_column:i.name,confidence:g});break}}}return r.filter(n=>n.confidence>=.5)}function _r(e,t){if(t.length===0)return e;const r=new Map;for(const n of t){const s=new Map;for(const a of e){const o=a[n.id_column],c=a[n.name_column];o!=null&&c&&s.set(o,c)}r.set(n.id_column,s)}return e.map(n=>{const s={...n};for(const a of t){const o=s[a.id_column],c=r.get(a.id_column);c&&c.has(o)&&(s[`${a.id_column}_original`]=o,s[a.id_column]=c.get(o))}return s})}const bn=new Me;bn.post("/",async e=>{try{const r=(await e.req.formData()).get("file");if(!r)return e.json({error:"No file provided"},400);const n=r.name,s=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!s)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(r.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const a=await r.text();let o;if(s==="csv")o=br(a);else try{const x=JSON.parse(a);o=Array.isArray(x)?x:[x]}catch{return e.json({error:"Invalid JSON format"},400)}if(o.length===0)return e.json({error:"File contains no data"},400);if(o.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=vr(o),l=Object.keys(o[0]).map(x=>({name:x,type:c[x]||"string",nullable:o.some(_=>_[x]===null||_[x]===void 0||_[x]===""),unique_count:new Set(o.map(_=>_[x])).size,sample_values:o.slice(0,3).map(_=>_[x])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,s,o.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id,m=o.map((x,_)=>e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,_,JSON.stringify(x),0)),g=100;for(let x=0;x<m.length;x+=g){const _=m.slice(x,x+g);await e.env.DB.batch(_)}console.log("Detecting column mappings...");const y=wr(l,o.length);console.log(`Detected ${y.length} column mappings`);for(const x of y)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,x.id_column,x.name_column).run(),console.log(`  Mapped: ${x.id_column} -> ${x.name_column} (confidence: ${x.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:o.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Me;nt.get("/",async e=>{try{const r=(await e.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all()).results.map(n=>({...n,columns:JSON.parse(n.columns)}));return e.json({datasets:r})}catch{return e.json({error:"Failed to fetch datasets"},500)}});nt.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const s=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(t).all()).results.map(a=>JSON.parse(a.data));return e.json({dataset:{...r,columns:JSON.parse(r.columns)},sample:s})}catch{return e.json({error:"Failed to fetch dataset"},500)}});nt.get("/:id/analyses",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(t).all()).results.map(s=>({...s,result:JSON.parse(s.result)}));return e.json({analyses:n})}catch{return e.json({error:"Failed to fetch analyses"},500)}});nt.get("/:id/visualizations",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(t).all()).results.map(s=>({...s,config:JSON.parse(s.config)}));return e.json({visualizations:n})}catch{return e.json({error:"Failed to fetch visualizations"},500)}});nt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function Er(e,t){const r=e.filter(a=>a!=null&&a!==""),n=e.length-r.length,s=new Set(r).size;if(t==="number"){const a=r.map(o=>Number(o)).filter(o=>!isNaN(o));return{count:e.length,mean:Ie(a),median:Rr(a),mode:Ht(a),stdDev:Sr(a),min:Math.min(...a),max:Math.max(...a),q1:ct(a,25),q2:ct(a,50),q3:ct(a,75),nullCount:n,uniqueCount:s}}return{count:e.length,mode:Ht(r),min:r[0],max:r[r.length-1],nullCount:n,uniqueCount:s}}function Ie(e){return e.length===0?0:e.reduce((t,r)=>t+r,0)/e.length}function Rr(e){if(e.length===0)return 0;const t=[...e].sort((n,s)=>n-s),r=Math.floor(t.length/2);return t.length%2===0?(t[r-1]+t[r])/2:t[r]}function Ht(e){if(e.length===0)return null;const t={};let r=0,n=null;for(const s of e){const a=String(s);t[a]=(t[a]||0)+1,t[a]>r&&(r=t[a],n=s)}return n}function Sr(e){if(e.length===0)return 0;const t=Ie(e),r=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Ie(r))}function ct(e,t){if(e.length===0)return 0;const r=[...e].sort((c,l)=>c-l),n=t/100*(r.length-1),s=Math.floor(n),a=Math.ceil(n),o=n%1;return s===a?r[s]:r[s]*(1-o)+r[a]*o}function Cr(e){if(e.length<4)return{indices:[],threshold:0};const t=ct(e,25),r=ct(e,75),n=r-t,s=t-1.5*n,a=r+1.5*n,o=[];return e.forEach((c,l)=>{(c<s||c>a)&&o.push(l)}),{indices:o,threshold:n}}function Or(e,t){if(e.length!==t.length||e.length===0)return 0;const r=e.length,n=Ie(e),s=Ie(t);let a=0,o=0,c=0;for(let l=0;l<r;l++){const i=e[l]-n,h=t[l]-s;a+=i*h,o+=i*i,c+=h*h}return o===0||c===0?0:a/Math.sqrt(o*c)}function kr(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,r=Array.from({length:t},(i,h)=>h),n=Ie(r),s=Ie(e);let a=0,o=0;for(let i=0;i<t;i++)a+=(r[i]-n)*(e[i]-s),o+=Math.pow(r[i]-n,2);const c=o===0?0:a/o,l=Math.min(Math.abs(c)/(Ie(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function it(e,t,r,n){var o;let s=50;const a=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(s-=30,a.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(s-=25,a.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(s-=30,a.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(s-=20,a.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(s-=40,a.push("All values are identical")):n.uniqueCount===n.count?(s-=35,a.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(s-=25,a.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(s+=20,a.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(s+=15,a.push("High variability in data"));break;case"correlation":const c=Math.abs(r.correlation||0);c>.8?(s+=30,a.push("Very strong correlation")):c>.6?(s+=20,a.push("Strong correlation")):c>.5&&(s+=10,a.push("Moderate correlation"));break;case"outlier":const i=(r.count||0)/(n.count||1);i>.05&&i<.2?(s+=25,a.push("Significant outliers detected")):i>0&&(s+=10,a.push("Some outliers present"));break;case"pattern":const h=(o=r.topPatterns)==null?void 0:o[0];if(h){const[,g]=h,y=g/n.count;y>.3&&y<.9&&(s+=20,a.push("Clear dominant pattern"))}break;case"trend":const m=r.strength||0;m>.5?(s+=30,a.push("Strong trend detected")):m>.3&&(s+=15,a.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(s-=30,a.push("More than 50% missing data")):c>.2&&(s-=15,a.push("Significant missing data"))}return s=Math.max(0,Math.min(100,s)),{score:s,reasons:a}}async function Tr(e,t,r,n){console.log(`Starting analysis for dataset ${e}`);for(const a of r){const o=t.map(m=>m[a.name]),c=Er(o,a.type),l=Ar(a.name,a.type,c),i=$r(c,a.type),h=it("statistics",a.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",a.name,JSON.stringify(c),1,l,i,h.score).run(),a.type==="number"){const m=o.map(y=>Number(y)).filter(y=>!isNaN(y)),g=Cr(m);if(g.indices.length>0){const y=`Found ${g.indices.length} unusual values in "${a.name}" (${(g.indices.length/m.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,x={count:g.indices.length,indices:g.indices.slice(0,10)},_=it("outlier",a.name,x,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",a.name,JSON.stringify(x),.85,y,g.indices.length>m.length*.05?"high":"medium",_.score).run()}if(m.length>5){const y=kr(m);if(y.direction!=="stable"){const x=`"${a.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,_=it("trend",a.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",a.name,JSON.stringify(y),y.strength,x,y.strength>.5?"high":"medium",_.score).run()}}}}const s=r.filter(a=>a.type==="number");for(let a=0;a<s.length;a++)for(let o=a+1;o<s.length;o++){const c=s[a],l=s[o],i=t.map(m=>Number(m[c.name])).filter(m=>!isNaN(m)),h=t.map(m=>Number(m[l.name])).filter(m=>!isNaN(m));if(i.length>5&&h.length>5){const m=Or(i,h);if(Math.abs(m)>.5){const g=jr(c.name,l.name,m),y={column1:c.name,column2:l.name,correlation:m},x=it("correlation",void 0,y,{count:i.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(m),g,Math.abs(m)>.7?"high":"medium",x.score).run()}}}for(const a of r)if(a.type==="string"){const o=t.map(h=>h[a.name]).filter(h=>h),c={};o.forEach(h=>{c[h]=(c[h]||0)+1});const i=Object.entries(c).sort((h,m)=>m[1]-h[1]).slice(0,5);if(i.length>0&&i[0][1]>o.length*.1){const h=`The most common value in "${a.name}" is "${i[0][0]}" appearing ${i[0][1]} times (${(i[0][1]/o.length*100).toFixed(1)}% of records).`,m={topPatterns:i},g={count:o.length,uniqueCount:new Set(o).size},y=it("pattern",a.name,m,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",a.name,JSON.stringify(m),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Ar(e,t,r){var n,s,a,o;return t==="number"?`"${e}" ranges from ${(n=r.min)==null?void 0:n.toFixed(2)} to ${(s=r.max)==null?void 0:s.toFixed(2)} with an average of ${(a=r.mean)==null?void 0:a.toFixed(2)}. About half the values are below ${(o=r.median)==null?void 0:o.toFixed(2)}.`:`"${e}" contains ${r.count} values with ${r.uniqueCount} unique entries. Most common: "${r.mode}".`}function jr(e,t,r){const n=Math.abs(r)>.7?"strong":"moderate";return r>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${r.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${r.toFixed(2)}).`}function $r(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function Nr(e,t,r,n){console.log(`Generating visualizations for dataset ${e}`);const s=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),a=new Map;s.results.forEach(l=>{a.set(l.id_column,l.name_column)});let o=0;const c=[...r].sort((l,i)=>(i.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const i=await Dr(l,t,a);i&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,i.chartType,i.title,JSON.stringify(i.config),i.explanation,o++).run()}console.log(`Generated ${o} visualizations`)}function Dr(e,t,r){switch(e.analysis_type){case"statistics":return Ir(e,t,r);case"correlation":return Mr(e,t,r);case"outlier":return Pr(e,t,r);case"pattern":return Fr(e,t,r);case"trend":return Lr(e,t,r);default:return null}}function Ir(e,t,r){const n=e.column_name;if(!n)return null;const s=e.result,a=r.has(n)?` (via ${r.get(n)})`:"";if(s.mean!==void 0){const i=t.map(m=>Number(m[n])).filter(m=>!isNaN(m)),h=qr(i);return{chartType:"bar",title:`Distribution: ${n}${a}`,explanation:`This histogram shows how values in "${n}" are distributed${a?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const o=t.map(i=>i[n]).filter(i=>i!=null),c={};o.forEach(i=>{c[String(i)]=(c[String(i)]||0)+1});const l=Object.entries(c).sort((i,h)=>h[1]-i[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${a}`,explanation:`This chart shows the most common values in "${n}"${a?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([i])=>i),datasets:[{label:"Count",data:l.map(([,i])=>i),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function Mr(e,t,r){const n=e.result,s=n.column1,a=n.column2;if(!s||!a)return null;const o=r.has(s)?` (via ${r.get(s)})`:"",c=r.has(a)?` (via ${r.get(a)})`:"",l=t.map(m=>({x:Number(m[s]),y:Number(m[a])})).filter(m=>!isNaN(m.x)&&!isNaN(m.y)),i=n.correlation,h=i>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${s}${o} vs ${a}${c}`,explanation:`Each dot represents one record${o||c?" using human-readable names":""}. ${i>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${s} vs ${a}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${i.toFixed(2)}`}},scales:{x:{title:{display:!0,text:s}},y:{title:{display:!0,text:a}}}}}}}function Pr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=new Set(e.result.indices||[]),o=t.map((i,h)=>({x:h,y:Number(i[n]),isOutlier:a.has(h)})).filter(i=>!isNaN(i.y)),c=o.filter(i=>!i.isOutlier),l=o.filter(i=>i.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${s}`,explanation:`Red dots are unusual values that stand out from the pattern${s?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Fr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=e.result.topPatterns||[];if(a.length===0)return null;const o=a.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${s}`,explanation:`Each slice shows what percentage of records have that value${s?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:o.map(([c])=>c),datasets:[{data:o.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Lr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),o=e.result,c=o.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${s}`,explanation:`This line shows how "${n}" changes over time${s?" using human-readable names":""}. ${o.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:a.map((l,i)=>`#${i+1}`),datasets:[{label:n,data:a,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${o.direction==="up"?"↗":"↘"} ${Math.round(o.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function qr(e,t=10){if(e.length===0)return{labels:[],data:[]};const r=Math.min(...e),a=(Math.max(...e)-r)/t,o=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const i=r+l*a,h=r+(l+1)*a;c.push(`${i.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let i=Math.floor((l-r)/a);i>=t&&(i=t-1),i<0&&(i=0),o[i]++}),{labels:c,data:o}}const vn=new Me;vn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);let s=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(i=>JSON.parse(i.data));const a=JSON.parse(r.columns),o=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(o.results.length>0){const i=o.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${i.length} column mappings for human-readable analysis...`),s=_r(s,i);for(const h of i){const m=a.find(g=>g.name===h.id_column);m&&(m.enriched_by=h.name_column)}}await Tr(t,s,a,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(i=>({...i,result:JSON.parse(i.result)}));return await Nr(t,s,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const xn=new Me;xn.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const n=JSON.parse(r.columns),a=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),o=[],c=[],l=new Map;for(const g of n){const y=`col_${g.name}`;if(!l.has(y)){const _=10+g.unique_count/r.row_count*30;o.push({id:y,label:g.name,type:"column",size:_}),l.set(y,!0)}}const i=a.filter(g=>g.analysis_type==="correlation"),h=i.sort((g,y)=>Math.abs(y.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,i.length));for(const g of h){const{column1:y,column2:x,correlation:_}=g.result,M=`col_${y}`,$=`col_${x}`;n.length>50&&Math.abs(_)<.7||c.push({source:M,target:$,type:"correlation",strength:Math.abs(_),label:`${_>0?"+":""}${_.toFixed(2)}`})}const m=a.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of m){const y=g.column_name;if(!y)continue;const{topPatterns:x}=g.result;if(!x||x.length===0)continue;const _=x.slice(0,3);for(const[M,$]of _){const ie=`val_${y}_${M}`;l.has(ie)||(o.push({id:ie,label:String(M),type:"value",size:5+$/r.row_count*20}),l.set(ie,!0)),c.push({source:`col_${y}`,target:ie,type:"contains",strength:$/r.row_count,label:`${$}x`})}}return e.json({nodes:o,edges:c,dataset_name:r.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const Rt=new Me;Rt.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),r=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:r.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});Rt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});Rt.post("/",async e=>{try{const{dataset_id:t,id_column:r,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,r,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const wn=new Me;wn.post("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),{message:r,conversationHistory:n=[]}=await e.req.json(),s=e.env.OPENAI_API_KEY;if(!s)return e.json({error:"OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",message:zt(r)},500);const a=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!a)return e.json({error:"Dataset not found"},404);const c=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC LIMIT 20
    `).bind(t).all()).results.map($=>({type:$.analysis_type,column:$.column_name,importance:$.importance,confidence:$.confidence,quality_score:$.quality_score,explanation:$.explanation,result:JSON.parse($.result)})),l=JSON.parse(a.columns),i=Hr(a,l,c),m=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${a.name}
Rows: ${a.row_count}
Columns: ${a.column_count}

${i}

Your role:
- Explain findings in plain, conversational English
- Answer questions about patterns, correlations, outliers
- Provide specific numbers and examples from the data
- Suggest what to investigate next
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists

If asked about specific insights not in the context, politely explain what data you have access to.`},...n,{role:"user",content:r}],g=e.env.OPENAI_MODEL||"gpt-4o-mini",y=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({model:g,messages:m,max_tokens:1e3,temperature:.7})});if(!y.ok){const $=await y.text();return console.error("OpenAI API error:",$),e.json({error:"Failed to get response from OpenAI",message:zt(r)},500)}const _=(await y.json()).choices[0].message.content,M=zr(r,c);return e.json({message:_,suggestions:M})}catch(t){return console.error("Chat error:",t),e.json({error:"Chat failed: "+t.message,message:"I encountered an error. Please try asking your question differently."},500)}});function Hr(e,t,r){let n=`
Columns (showing first 30):
`;return t.slice(0,30).forEach(s=>{n+=`- ${s.name} (${s.type}, ${s.unique_count} unique values)
`}),t.length>30&&(n+=`... and ${t.length-30} more columns
`),n+=`
Top ${Math.min(20,r.length)} Insights (sorted by quality):
`,r.forEach((s,a)=>{var o;n+=`
${a+1}. ${s.type.toUpperCase()}`,s.column&&(n+=` on "${s.column}"`),n+=`:
`,n+=`   ${s.explanation}
`,n+=`   Importance: ${s.importance}, Confidence: ${Math.round(s.confidence*100)}%, Quality: ${((o=s.quality_score)==null?void 0:o.toFixed(0))||"N/A"}
`,s.type==="correlation"&&s.result.correlation&&(n+=`   Correlation coefficient: ${s.result.correlation.toFixed(3)}
`),s.type==="outlier"&&s.result.count&&(n+=`   Outliers found: ${s.result.count} rows
`)}),n}function zr(e,t){const r=e.toLowerCase(),n=[];r.includes("correlat")||r.includes("relation")?(n.push("Are there any unusual outliers?"),n.push("What patterns exist in categorical data?")):r.includes("outlier")||r.includes("unusual")?(n.push("What are the strongest correlations?"),n.push("Show me trends over time")):r.includes("pattern")?(n.push("Are there any trends in the data?"),n.push("Which columns are most correlated?")):(n.push("What's the most important finding?"),n.push("Which columns have outliers?"),n.push("Show me strong correlations"));const s=t.filter(a=>(a.quality_score||0)>70);return s.length>0&&n.length<4&&n.push(`Tell me more about ${s[0].column||"the top finding"}`),n.slice(0,3)}function zt(e){const t=e.toLowerCase();return t.includes("correlat")||t.includes("relation")?"I found several correlations in your data. Check the 'Insights' tab and search for 'correlation' to see the strongest relationships between columns.":t.includes("outlier")||t.includes("unusual")?"To see outliers, go to the 'Insights' tab and search for 'outlier'. I've highlighted unusual values in several columns.":t.includes("pattern")?"Patterns have been detected in your categorical columns. Search for 'pattern' in the Insights tab to see frequency distributions.":"I'm currently operating in fallback mode. To enable full AI chat, please configure your OpenAI API key in the .dev.vars file (for local) or as an environment variable (for production)."}const ye=new Me;ye.use("/api/*",nr());ye.use("/static/*",hr({root:"./public"}));ye.route("/api/upload",bn);ye.route("/api/datasets",nt);ye.route("/api/analyze",vn);ye.route("/api/relationships",xn);ye.route("/api/mappings",Rt);ye.route("/api/chat",wn);ye.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));ye.get("/",e=>e.html(`
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
  `));const Bt=new Me,Br=Object.assign({"/src/index.tsx":ye});let _n=!1;for(const[,e]of Object.entries(Br))e&&(Bt.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),Bt.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),_n=!0);if(!_n)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Bt as default};
