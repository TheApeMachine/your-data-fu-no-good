var wn=Object.defineProperty;var $t=e=>{throw TypeError(e)};var _n=(e,t,r)=>t in e?wn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var _=(e,t,r)=>_n(e,typeof t!="symbol"?t+"":t,r),Ct=(e,t,r)=>t.has(e)||$t("Cannot "+r);var f=(e,t,r)=>(Ct(e,t,"read from private field"),r?r.call(e):t.get(e)),T=(e,t,r)=>t.has(e)?$t("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),w=(e,t,r,n)=>(Ct(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),P=(e,t,r)=>(Ct(e,t,"access private method"),r);var It=(e,t,r,n)=>({set _(i){w(e,t,i,r)},get _(){return f(e,t,n)}});var Mt=(e,t,r)=>(n,i)=>{let s=-1;return o(0);async function o(c){if(c<=s)throw new Error("next() called multiple times");s=c;let l,a=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&i||void 0,h)try{l=await h(n,()=>o(c+1))}catch(g){if(g instanceof Error&&t)n.error=g,l=await t(g,n),a=!0;else throw g}else n.finalized===!1&&r&&(l=await r(n));return l&&(n.finalized===!1||a)&&(n.res=l),n}},En=Symbol(),Rn=async(e,t=Object.create(null))=>{const{all:r=!1,dot:n=!1}=t,s=(e instanceof rn?e.raw.headers:e.headers).get("Content-Type");return s!=null&&s.startsWith("multipart/form-data")||s!=null&&s.startsWith("application/x-www-form-urlencoded")?Sn(e,{all:r,dot:n}):{}};async function Sn(e,t){const r=await e.formData();return r?Cn(r,t):{}}function Cn(e,t){const r=Object.create(null);return e.forEach((n,i)=>{t.all||i.endsWith("[]")?On(r,i,n):r[i]=n}),t.dot&&Object.entries(r).forEach(([n,i])=>{n.includes(".")&&(Tn(r,n,i),delete r[n])}),r}var On=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},Tn=(e,t,r)=>{let n=e;const i=t.split(".");i.forEach((s,o)=>{o===i.length-1?n[s]=r:((!n[s]||typeof n[s]!="object"||Array.isArray(n[s])||n[s]instanceof File)&&(n[s]=Object.create(null)),n=n[s])})},Xt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},kn=e=>{const{groups:t,path:r}=jn(e),n=Xt(r);return An(n,t)},jn=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,n)=>{const i=`@${n}`;return t.push([i,r]),i}),{groups:t,path:e}},An=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[n]=t[r];for(let i=e.length-1;i>=0;i--)if(e[i].includes(n)){e[i]=e[i].replace(n,t[r][1]);break}}return e},gt={},Nn=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const n=`${e}#${t}`;return gt[n]||(r[2]?gt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:gt[n]=[e,r[1],!0]),gt[n]}return null},At=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},Dn=e=>At(e,decodeURI),Zt=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let n=r;for(;n<t.length;n++){const i=t.charCodeAt(n);if(i===37){const s=t.indexOf("?",n),o=t.slice(r,s===-1?void 0:s);return Dn(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(i===63)break}return t.slice(r,n)},$n=e=>{const t=Zt(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...r)=>(r.length&&(t=Ke(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),en=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let n="";return t.forEach(i=>{if(i!==""&&!/\:/.test(i))n+="/"+i;else if(/\:/.test(i))if(/\?/.test(i)){r.length===0&&n===""?r.push("/"):r.push(n);const s=i.replace("?","");n+="/"+s,r.push(n)}else n+="/"+i}),r.filter((i,s,o)=>o.indexOf(i)===s)},Ot=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?At(e,nn):e):e,tn=(e,t,r)=>{let n;if(!r&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const c=e.charCodeAt(o+t.length+1);if(c===61){const l=o+t.length+2,a=e.indexOf("&",l);return Ot(e.slice(l,a===-1?void 0:a))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(n=/[%+]/.test(e),!n)return}const i={};n??(n=/[%+]/.test(e));let s=e.indexOf("?",8);for(;s!==-1;){const o=e.indexOf("&",s+1);let c=e.indexOf("=",s);c>o&&o!==-1&&(c=-1);let l=e.slice(s+1,c===-1?o===-1?void 0:o:c);if(n&&(l=Ot(l)),s=o,l==="")continue;let a;c===-1?a="":(a=e.slice(c+1,o===-1?void 0:o),n&&(a=Ot(a))),r?(i[l]&&Array.isArray(i[l])||(i[l]=[]),i[l].push(a)):i[l]??(i[l]=a)}return t?i[t]:i},In=tn,Mn=(e,t)=>tn(e,t,!0),nn=decodeURIComponent,Ft=e=>At(e,nn),Qe,de,Ce,sn,an,kt,ke,Ut,rn=(Ut=class{constructor(e,t="/",r=[[]]){T(this,Ce);_(this,"raw");T(this,Qe);T(this,de);_(this,"routeIndex",0);_(this,"path");_(this,"bodyCache",{});T(this,ke,e=>{const{bodyCache:t,raw:r}=this,n=t[e];if(n)return n;const i=Object.keys(t)[0];return i?t[i].then(s=>(i==="json"&&(s=JSON.stringify(s)),new Response(s)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,w(this,de,r),w(this,Qe,{})}param(e){return e?P(this,Ce,sn).call(this,e):P(this,Ce,an).call(this)}query(e){return In(this.url,e)}queries(e){return Mn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,n)=>{t[n]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Rn(this,e))}json(){return f(this,ke).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,ke).call(this,"text")}arrayBuffer(){return f(this,ke).call(this,"arrayBuffer")}blob(){return f(this,ke).call(this,"blob")}formData(){return f(this,ke).call(this,"formData")}addValidatedData(e,t){f(this,Qe)[e]=t}valid(e){return f(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[En](){return f(this,de)}get matchedRoutes(){return f(this,de)[0].map(([[,e]])=>e)}get routePath(){return f(this,de)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,de=new WeakMap,Ce=new WeakSet,sn=function(e){const t=f(this,de)[0][this.routeIndex][1][e],r=P(this,Ce,kt).call(this,t);return r&&/\%/.test(r)?Ft(r):r},an=function(){const e={},t=Object.keys(f(this,de)[0][this.routeIndex][1]);for(const r of t){const n=P(this,Ce,kt).call(this,f(this,de)[0][this.routeIndex][1][r]);n!==void 0&&(e[r]=/\%/.test(n)?Ft(n):n)}return e},kt=function(e){return f(this,de)[1]?f(this,de)[1][e]:e},ke=new WeakMap,Ut),Fn={Stringify:1},on=async(e,t,r,n,i)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const s=e.callbacks;return s!=null&&s.length?(i?i[0]+=e:i=[e],Promise.all(s.map(c=>c({phase:t,buffer:i,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>on(l,t,!1,n,i))).then(()=>i[0]))):Promise.resolve(e)},Pn="text/plain; charset=UTF-8",Tt=(e,t)=>({"Content-Type":e,...t}),ut,dt,_e,Xe,Ee,se,ht,Ze,et,Le,ft,pt,je,Ye,Bt,Ln=(Bt=class{constructor(e,t){T(this,je);T(this,ut);T(this,dt);_(this,"env",{});T(this,_e);_(this,"finalized",!1);_(this,"error");T(this,Xe);T(this,Ee);T(this,se);T(this,ht);T(this,Ze);T(this,et);T(this,Le);T(this,ft);T(this,pt);_(this,"render",(...e)=>(f(this,Ze)??w(this,Ze,t=>this.html(t)),f(this,Ze).call(this,...e)));_(this,"setLayout",e=>w(this,ht,e));_(this,"getLayout",()=>f(this,ht));_(this,"setRenderer",e=>{w(this,Ze,e)});_(this,"header",(e,t,r)=>{this.finalized&&w(this,se,new Response(f(this,se).body,f(this,se)));const n=f(this,se)?f(this,se).headers:f(this,Le)??w(this,Le,new Headers);t===void 0?n.delete(e):r!=null&&r.append?n.append(e,t):n.set(e,t)});_(this,"status",e=>{w(this,Xe,e)});_(this,"set",(e,t)=>{f(this,_e)??w(this,_e,new Map),f(this,_e).set(e,t)});_(this,"get",e=>f(this,_e)?f(this,_e).get(e):void 0);_(this,"newResponse",(...e)=>P(this,je,Ye).call(this,...e));_(this,"body",(e,t,r)=>P(this,je,Ye).call(this,e,t,r));_(this,"text",(e,t,r)=>!f(this,Le)&&!f(this,Xe)&&!t&&!r&&!this.finalized?new Response(e):P(this,je,Ye).call(this,e,t,Tt(Pn,r)));_(this,"json",(e,t,r)=>P(this,je,Ye).call(this,JSON.stringify(e),t,Tt("application/json",r)));_(this,"html",(e,t,r)=>{const n=i=>P(this,je,Ye).call(this,i,t,Tt("text/html; charset=UTF-8",r));return typeof e=="object"?on(e,Fn.Stringify,!1,{}).then(n):n(e)});_(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});_(this,"notFound",()=>(f(this,et)??w(this,et,()=>new Response),f(this,et).call(this,this)));w(this,ut,e),t&&(w(this,Ee,t.executionCtx),this.env=t.env,w(this,et,t.notFoundHandler),w(this,pt,t.path),w(this,ft,t.matchResult))}get req(){return f(this,dt)??w(this,dt,new rn(f(this,ut),f(this,pt),f(this,ft))),f(this,dt)}get event(){if(f(this,Ee)&&"respondWith"in f(this,Ee))return f(this,Ee);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,Ee))return f(this,Ee);throw Error("This context has no ExecutionContext")}get res(){return f(this,se)||w(this,se,new Response(null,{headers:f(this,Le)??w(this,Le,new Headers)}))}set res(e){if(f(this,se)&&e){e=new Response(e.body,e);for(const[t,r]of f(this,se).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=f(this,se).headers.getSetCookie();e.headers.delete("set-cookie");for(const i of n)e.headers.append("set-cookie",i)}else e.headers.set(t,r)}w(this,se,e),this.finalized=!0}get var(){return f(this,_e)?Object.fromEntries(f(this,_e)):{}}},ut=new WeakMap,dt=new WeakMap,_e=new WeakMap,Xe=new WeakMap,Ee=new WeakMap,se=new WeakMap,ht=new WeakMap,Ze=new WeakMap,et=new WeakMap,Le=new WeakMap,ft=new WeakMap,pt=new WeakMap,je=new WeakSet,Ye=function(e,t,r){const n=f(this,se)?new Headers(f(this,se).headers):f(this,Le)??new Headers;if(typeof t=="object"&&"headers"in t){const s=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,c]of s)o.toLowerCase()==="set-cookie"?n.append(o,c):n.set(o,c)}if(r)for(const[s,o]of Object.entries(r))if(typeof o=="string")n.set(s,o);else{n.delete(s);for(const c of o)n.append(s,c)}const i=typeof t=="number"?t:(t==null?void 0:t.status)??f(this,Xe);return new Response(e,{status:i,headers:n})},Bt),G="ALL",qn="all",Hn=["get","post","put","delete","options","patch"],ln="Can not add a route since the matcher is already built.",cn=class extends Error{},zn="__COMPOSED_HANDLER",Un=e=>e.text("404 Not Found",404),Pt=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},pe,Q,dn,me,Fe,yt,bt,Wt,un=(Wt=class{constructor(t={}){T(this,Q);_(this,"get");_(this,"post");_(this,"put");_(this,"delete");_(this,"options");_(this,"patch");_(this,"all");_(this,"on");_(this,"use");_(this,"router");_(this,"getPath");_(this,"_basePath","/");T(this,pe,"/");_(this,"routes",[]);T(this,me,Un);_(this,"errorHandler",Pt);_(this,"onError",t=>(this.errorHandler=t,this));_(this,"notFound",t=>(w(this,me,t),this));_(this,"fetch",(t,...r)=>P(this,Q,bt).call(this,t,r[1],r[0],t.method));_(this,"request",(t,r,n,i)=>t instanceof Request?this.fetch(r?new Request(t,r):t,n,i):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,r),n,i)));_(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(P(this,Q,bt).call(this,t.request,t,void 0,t.request.method))})});[...Hn,qn].forEach(s=>{this[s]=(o,...c)=>(typeof o=="string"?w(this,pe,o):P(this,Q,Fe).call(this,s,f(this,pe),o),c.forEach(l=>{P(this,Q,Fe).call(this,s,f(this,pe),l)}),this)}),this.on=(s,o,...c)=>{for(const l of[o].flat()){w(this,pe,l);for(const a of[s].flat())c.map(h=>{P(this,Q,Fe).call(this,a.toUpperCase(),f(this,pe),h)})}return this},this.use=(s,...o)=>(typeof s=="string"?w(this,pe,s):(w(this,pe,"*"),o.unshift(s)),o.forEach(c=>{P(this,Q,Fe).call(this,G,f(this,pe),c)}),this);const{strict:n,...i}=t;Object.assign(this,i),this.getPath=n??!0?t.getPath??Zt:$n}route(t,r){const n=this.basePath(t);return r.routes.map(i=>{var o;let s;r.errorHandler===Pt?s=i.handler:(s=async(c,l)=>(await Mt([],r.errorHandler)(c,()=>i.handler(c,l))).res,s[zn]=i.handler),P(o=n,Q,Fe).call(o,i.method,i.path,s)}),this}basePath(t){const r=P(this,Q,dn).call(this);return r._basePath=Ke(this._basePath,t),r}mount(t,r,n){let i,s;n&&(typeof n=="function"?s=n:(s=n.optionHandler,n.replaceRequest===!1?i=l=>l:i=n.replaceRequest));const o=s?l=>{const a=s(l);return Array.isArray(a)?a:[a]}:l=>{let a;try{a=l.executionCtx}catch{}return[l.env,a]};i||(i=(()=>{const l=Ke(this._basePath,t),a=l==="/"?0:l.length;return h=>{const g=new URL(h.url);return g.pathname=g.pathname.slice(a)||"/",new Request(g,h)}})());const c=async(l,a)=>{const h=await r(i(l.req.raw),...o(l));if(h)return h;await a()};return P(this,Q,Fe).call(this,G,Ke(t,"*"),c),this}},pe=new WeakMap,Q=new WeakSet,dn=function(){const t=new un({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,w(t,me,f(this,me)),t.routes=this.routes,t},me=new WeakMap,Fe=function(t,r,n){t=t.toUpperCase(),r=Ke(this._basePath,r);const i={basePath:this._basePath,path:r,method:t,handler:n};this.router.add(t,r,[n,i]),this.routes.push(i)},yt=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},bt=function(t,r,n,i){if(i==="HEAD")return(async()=>new Response(null,await P(this,Q,bt).call(this,t,r,n,"GET")))();const s=this.getPath(t,{env:n}),o=this.router.match(i,s),c=new Ln(t,{path:s,matchResult:o,env:n,executionCtx:r,notFoundHandler:f(this,me)});if(o[0].length===1){let a;try{a=o[0][0][0][0](c,async()=>{c.res=await f(this,me).call(this,c)})}catch(h){return P(this,Q,yt).call(this,h,c)}return a instanceof Promise?a.then(h=>h||(c.finalized?c.res:f(this,me).call(this,c))).catch(h=>P(this,Q,yt).call(this,h,c)):a??f(this,me).call(this,c)}const l=Mt(o[0],this.errorHandler,f(this,me));return(async()=>{try{const a=await l(c);if(!a.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return a.res}catch(a){return P(this,Q,yt).call(this,a,c)}})()},Wt),hn=[];function Bn(e,t){const r=this.buildAllMatchers(),n=(i,s)=>{const o=r[i]||r[G],c=o[2][s];if(c)return c;const l=s.match(o[0]);if(!l)return[[],hn];const a=l.indexOf("",1);return[o[1][a],l]};return this.match=n,n(e,t)}var wt="[^/]+",ot=".*",lt="(?:|/.*)",Ge=Symbol(),Wn=new Set(".\\+*[^]$()");function Vn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===ot||e===lt?1:t===ot||t===lt?-1:e===wt?1:t===wt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var qe,He,ge,Vt,jt=(Vt=class{constructor(){T(this,qe);T(this,He);T(this,ge,Object.create(null))}insert(t,r,n,i,s){if(t.length===0){if(f(this,qe)!==void 0)throw Ge;if(s)return;w(this,qe,r);return}const[o,...c]=t,l=o==="*"?c.length===0?["","",ot]:["","",wt]:o==="/*"?["","",lt]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let a;if(l){const h=l[1];let g=l[2]||wt;if(h&&l[2]&&(g===".*"||(g=g.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(g))))throw Ge;if(a=f(this,ge)[g],!a){if(Object.keys(f(this,ge)).some(m=>m!==ot&&m!==lt))throw Ge;if(s)return;a=f(this,ge)[g]=new jt,h!==""&&w(a,He,i.varIndex++)}!s&&h!==""&&n.push([h,f(a,He)])}else if(a=f(this,ge)[o],!a){if(Object.keys(f(this,ge)).some(h=>h.length>1&&h!==ot&&h!==lt))throw Ge;if(s)return;a=f(this,ge)[o]=new jt}a.insert(c,r,n,i,s)}buildRegExpStr(){const r=Object.keys(f(this,ge)).sort(Vn).map(n=>{const i=f(this,ge)[n];return(typeof f(i,He)=="number"?`(${n})@${f(i,He)}`:Wn.has(n)?`\\${n}`:n)+i.buildRegExpStr()});return typeof f(this,qe)=="number"&&r.unshift(`#${f(this,qe)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},qe=new WeakMap,He=new WeakMap,ge=new WeakMap,Vt),_t,mt,Jt,Jn=(Jt=class{constructor(){T(this,_t,{varIndex:0});T(this,mt,new jt)}insert(e,t,r){const n=[],i=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const a=`@\\${o}`;return i[o]=[a,l],o++,c=!0,a}),!c)break}const s=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=i.length-1;o>=0;o--){const[c]=i[o];for(let l=s.length-1;l>=0;l--)if(s[l].indexOf(c)!==-1){s[l]=s[l].replace(c,i[o][1]);break}}return f(this,mt).insert(s,t,n,f(this,_t),r),n}buildRegExp(){let e=f(this,mt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(i,s,o)=>s!==void 0?(r[++t]=Number(s),"$()"):(o!==void 0&&(n[Number(o)]=++t),"")),[new RegExp(`^${e}`),r,n]}},_t=new WeakMap,mt=new WeakMap,Jt),Kn=[/^$/,[],Object.create(null)],vt=Object.create(null);function fn(e){return vt[e]??(vt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Yn(){vt=Object.create(null)}function Gn(e){var a;const t=new Jn,r=[];if(e.length===0)return Kn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,g],[m,y])=>h?1:m?-1:g.length-y.length),i=Object.create(null);for(let h=0,g=-1,m=n.length;h<m;h++){const[y,$,O]=n[h];y?i[$]=[O.map(([H])=>[H,Object.create(null)]),hn]:g++;let M;try{M=t.insert($,g,y)}catch(H){throw H===Ge?new cn($):H}y||(r[g]=O.map(([H,ae])=>{const Oe=Object.create(null);for(ae-=1;ae>=0;ae--){const[oe,Me]=M[ae];Oe[oe]=Me}return[H,Oe]}))}const[s,o,c]=t.buildRegExp();for(let h=0,g=r.length;h<g;h++)for(let m=0,y=r[h].length;m<y;m++){const $=(a=r[h][m])==null?void 0:a[1];if(!$)continue;const O=Object.keys($);for(let M=0,H=O.length;M<H;M++)$[O[M]]=c[$[O[M]]]}const l=[];for(const h in o)l[h]=r[o[h]];return[s,l,i]}function Je(e,t){if(e){for(const r of Object.keys(e).sort((n,i)=>i.length-n.length))if(fn(r).test(t))return[...e[r]]}}var Ae,Ne,Et,pn,Kt,Qn=(Kt=class{constructor(){T(this,Et);_(this,"name","RegExpRouter");T(this,Ae);T(this,Ne);_(this,"match",Bn);w(this,Ae,{[G]:Object.create(null)}),w(this,Ne,{[G]:Object.create(null)})}add(e,t,r){var c;const n=f(this,Ae),i=f(this,Ne);if(!n||!i)throw new Error(ln);n[e]||[n,i].forEach(l=>{l[e]=Object.create(null),Object.keys(l[G]).forEach(a=>{l[e][a]=[...l[G][a]]})}),t==="/*"&&(t="*");const s=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=fn(t);e===G?Object.keys(n).forEach(a=>{var h;(h=n[a])[t]||(h[t]=Je(n[a],t)||Je(n[G],t)||[])}):(c=n[e])[t]||(c[t]=Je(n[e],t)||Je(n[G],t)||[]),Object.keys(n).forEach(a=>{(e===G||e===a)&&Object.keys(n[a]).forEach(h=>{l.test(h)&&n[a][h].push([r,s])})}),Object.keys(i).forEach(a=>{(e===G||e===a)&&Object.keys(i[a]).forEach(h=>l.test(h)&&i[a][h].push([r,s]))});return}const o=en(t)||[t];for(let l=0,a=o.length;l<a;l++){const h=o[l];Object.keys(i).forEach(g=>{var m;(e===G||e===g)&&((m=i[g])[h]||(m[h]=[...Je(n[g],h)||Je(n[G],h)||[]]),i[g][h].push([r,s-a+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(f(this,Ne)).concat(Object.keys(f(this,Ae))).forEach(t=>{e[t]||(e[t]=P(this,Et,pn).call(this,t))}),w(this,Ae,w(this,Ne,void 0)),Yn(),e}},Ae=new WeakMap,Ne=new WeakMap,Et=new WeakSet,pn=function(e){const t=[];let r=e===G;return[f(this,Ae),f(this,Ne)].forEach(n=>{const i=n[e]?Object.keys(n[e]).map(s=>[s,n[e][s]]):[];i.length!==0?(r||(r=!0),t.push(...i)):e!==G&&t.push(...Object.keys(n[G]).map(s=>[s,n[G][s]]))}),r?Gn(t):null},Kt),De,Re,Yt,Xn=(Yt=class{constructor(e){_(this,"name","SmartRouter");T(this,De,[]);T(this,Re,[]);w(this,De,e.routers)}add(e,t,r){if(!f(this,Re))throw new Error(ln);f(this,Re).push([e,t,r])}match(e,t){if(!f(this,Re))throw new Error("Fatal error");const r=f(this,De),n=f(this,Re),i=r.length;let s=0,o;for(;s<i;s++){const c=r[s];try{for(let l=0,a=n.length;l<a;l++)c.add(...n[l]);o=c.match(e,t)}catch(l){if(l instanceof cn)continue;throw l}this.match=c.match.bind(c),w(this,De,[c]),w(this,Re,void 0);break}if(s===i)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(f(this,Re)||f(this,De).length!==1)throw new Error("No active router has been determined yet.");return f(this,De)[0]}},De=new WeakMap,Re=new WeakMap,Yt),it=Object.create(null),$e,re,ze,tt,ee,Se,Pe,Gt,mn=(Gt=class{constructor(e,t,r){T(this,Se);T(this,$e);T(this,re);T(this,ze);T(this,tt,0);T(this,ee,it);if(w(this,re,r||Object.create(null)),w(this,$e,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},w(this,$e,[n])}w(this,ze,[])}insert(e,t,r){w(this,tt,++It(this,tt)._);let n=this;const i=kn(t),s=[];for(let o=0,c=i.length;o<c;o++){const l=i[o],a=i[o+1],h=Nn(l,a),g=Array.isArray(h)?h[0]:l;if(g in f(n,re)){n=f(n,re)[g],h&&s.push(h[1]);continue}f(n,re)[g]=new mn,h&&(f(n,ze).push(h),s.push(h[1])),n=f(n,re)[g]}return f(n,$e).push({[e]:{handler:r,possibleKeys:s.filter((o,c,l)=>l.indexOf(o)===c),score:f(this,tt)}}),n}search(e,t){var c;const r=[];w(this,ee,it);let i=[this];const s=Xt(t),o=[];for(let l=0,a=s.length;l<a;l++){const h=s[l],g=l===a-1,m=[];for(let y=0,$=i.length;y<$;y++){const O=i[y],M=f(O,re)[h];M&&(w(M,ee,f(O,ee)),g?(f(M,re)["*"]&&r.push(...P(this,Se,Pe).call(this,f(M,re)["*"],e,f(O,ee))),r.push(...P(this,Se,Pe).call(this,M,e,f(O,ee)))):m.push(M));for(let H=0,ae=f(O,ze).length;H<ae;H++){const Oe=f(O,ze)[H],oe=f(O,ee)===it?{}:{...f(O,ee)};if(Oe==="*"){const p=f(O,re)["*"];p&&(r.push(...P(this,Se,Pe).call(this,p,e,f(O,ee))),w(p,ee,oe),m.push(p));continue}const[Me,he,I]=Oe;if(!h&&!(I instanceof RegExp))continue;const u=f(O,re)[Me],d=s.slice(l).join("/");if(I instanceof RegExp){const p=I.exec(d);if(p){if(oe[he]=p[0],r.push(...P(this,Se,Pe).call(this,u,e,f(O,ee),oe)),Object.keys(f(u,re)).length){w(u,ee,oe);const b=((c=p[0].match(/\//))==null?void 0:c.length)??0;(o[b]||(o[b]=[])).push(u)}continue}}(I===!0||I.test(h))&&(oe[he]=h,g?(r.push(...P(this,Se,Pe).call(this,u,e,oe,f(O,ee))),f(u,re)["*"]&&r.push(...P(this,Se,Pe).call(this,f(u,re)["*"],e,oe,f(O,ee)))):(w(u,ee,oe),m.push(u)))}}i=m.concat(o.shift()??[])}return r.length>1&&r.sort((l,a)=>l.score-a.score),[r.map(({handler:l,params:a})=>[l,a])]}},$e=new WeakMap,re=new WeakMap,ze=new WeakMap,tt=new WeakMap,ee=new WeakMap,Se=new WeakSet,Pe=function(e,t,r,n){const i=[];for(let s=0,o=f(e,$e).length;s<o;s++){const c=f(e,$e)[s],l=c[t]||c[G],a={};if(l!==void 0&&(l.params=Object.create(null),i.push(l),r!==it||n&&n!==it))for(let h=0,g=l.possibleKeys.length;h<g;h++){const m=l.possibleKeys[h],y=a[l.score];l.params[m]=n!=null&&n[m]&&!y?n[m]:r[m]??(n==null?void 0:n[m]),a[l.score]=!0}}return i},Gt),Ue,Qt,Zn=(Qt=class{constructor(){_(this,"name","TrieRouter");T(this,Ue);w(this,Ue,new mn)}add(e,t,r){const n=en(t);if(n){for(let i=0,s=n.length;i<s;i++)f(this,Ue).insert(e,n[i],r);return}f(this,Ue).insert(e,t,r)}match(e,t){return f(this,Ue).search(e,t)}},Ue=new WeakMap,Qt),Be=class extends un{constructor(e={}){super(e),this.router=e.router??new Xn({routers:[new Qn,new Zn]})}},er=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(s=>typeof s=="string"?s==="*"?()=>s:o=>s===o?o:null:typeof s=="function"?s:o=>s.includes(o)?o:null)(r.origin),i=(s=>typeof s=="function"?s:Array.isArray(s)?()=>s:()=>[])(r.allowMethods);return async function(o,c){var h;function l(g,m){o.res.headers.set(g,m)}const a=await n(o.req.header("origin")||"",o);if(a&&l("Access-Control-Allow-Origin",a),r.origin!=="*"){const g=o.req.header("Vary");g?l("Vary",g):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),o.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const g=await i(o.req.header("origin")||"",o);g.length&&l("Access-Control-Allow-Methods",g.join(","));let m=r.allowHeaders;if(!(m!=null&&m.length)){const y=o.req.header("Access-Control-Request-Headers");y&&(m=y.split(/\s*,\s*/))}return m!=null&&m.length&&(l("Access-Control-Allow-Headers",m.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c()}},tr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Lt=(e,t=rr)=>{const r=/\.([a-zA-Z0-9]+?)$/,n=e.match(r);if(!n)return;let i=t[n[1]];return i&&i.startsWith("text")&&(i+="; charset=utf-8"),i},nr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},rr=nr,sr=(...e)=>{let t=e.filter(i=>i!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),n=[];for(const i of r)i===".."&&n.length>0&&n.at(-1)!==".."?n.pop():i!=="."&&n.push(i);return n.join("/")||"."},gn={br:".br",zstd:".zst",gzip:".gz"},ir=Object.keys(gn),ar="index.html",or=e=>{const t=e.root??"./",r=e.path,n=e.join??sr;return async(i,s)=>{var h,g,m,y;if(i.finalized)return s();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(i.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,i.req.path,i)),s()}let c=n(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=n(c,ar));const l=e.getContent;let a=await l(c,i);if(a instanceof Response)return i.newResponse(a.body,a);if(a){const $=e.mimes&&Lt(c,e.mimes)||Lt(c);if(i.header("Content-Type",$||"application/octet-stream"),e.precompressed&&(!$||tr.test($))){const O=new Set((g=i.req.header("Accept-Encoding"))==null?void 0:g.split(",").map(M=>M.trim()));for(const M of ir){if(!O.has(M))continue;const H=await l(c+gn[M],i);if(H){a=H,i.header("Content-Encoding",M),i.header("Vary","Accept-Encoding",{append:!0});break}}}return await((m=e.onFound)==null?void 0:m.call(e,c,i)),i.body(a)}await((y=e.onNotFound)==null?void 0:y.call(e,c,i)),await s()}},lr=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const i=r[e]||e;if(!i)return null;const s=await n.get(i,{type:"stream"});return s||null},cr=e=>async function(r,n){return or({...e,getContent:async s=>lr(s,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,n)},ur=e=>cr(e);function dr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var xt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var hr=xt.exports,qt;function fr(){return qt||(qt=1,(function(e,t){((r,n)=>{e.exports=n()})(hr,function r(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},i,s=!n.document&&!!n.postMessage,o=n.IS_PAPA_WORKER||!1,c={},l=0,a={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var p=Me(d);p.chunkSize=parseInt(p.chunkSize),d.step||d.chunk||(p.chunkSize=null),this._handle=new O(p),(this._handle.streamer=this)._config=p}).call(this,u),this.parseChunk=function(d,p){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let k=this._config.newline;k||(v=this._config.quoteChar||'"',k=this._handle.guessLineEndings(d,v)),d=[...d.split(k).slice(b)].join(k)}this.isFirstChunk&&I(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),o)n.postMessage({results:v,workerId:a.WORKER_ID,finished:b});else if(I(this._config.chunk)&&!p){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!I(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){I(this._config.error)?this._config.error(d):o&&this._config.error&&n.postMessage({workerId:a.WORKER_ID,error:d,finished:!1})}}function g(u){var d;(u=u||{}).chunkSize||(u.chunkSize=a.RemoteChunkSize),h.call(this,u),this._nextChunk=s?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(p){this._input=p,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),s||(d.onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!s),this._config.downloadRequestHeaders){var p,b=this._config.downloadRequestHeaders;for(p in b)d.setRequestHeader(p,b[p])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(k){this._chunkError(k.message)}s&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(p=>(p=p.getResponseHeader("Content-Range"))!==null?parseInt(p.substring(p.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(p){p=d.statusText||p,this._sendError(new Error(p))}}function m(u){(u=u||{}).chunkSize||(u.chunkSize=a.LocalChunkSize),h.call(this,u);var d,p,b=typeof FileReader<"u";this.stream=function(v){this._input=v,p=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=he(this._chunkLoaded,this),d.onerror=he(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,k=(this._config.chunkSize&&(k=Math.min(this._start+this._config.chunkSize,this._input.size),v=p.call(v,this._start,k)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:k}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(p){return d=p,this._nextChunk()},this._nextChunk=function(){var p,b;if(!this._finished)return p=this._config.chunkSize,d=p?(b=d.substring(0,p),d.substring(p)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function $(u){h.call(this,u=u||{});var d=[],p=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):p=!0},this._streamData=he(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),p&&(p=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(k){this._streamError(k)}},this),this._streamError=he(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=he(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=he(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function O(u){var d,p,b,v,k=Math.pow(2,53),J=-k,le=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ce=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,j=this,U=0,E=0,te=!1,S=!1,A=[],x={data:[],errors:[],meta:{}};function K(N){return u.skipEmptyLines==="greedy"?N.join("").trim()==="":N.length===1&&N[0].length===0}function V(){if(x&&b&&(ue("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+a.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(x.data=x.data.filter(function(R){return!K(R)})),Z()){let R=function(W,Y){I(u.transformHeader)&&(W=u.transformHeader(W,Y)),A.push(W)};if(x)if(Array.isArray(x.data[0])){for(var N=0;Z()&&N<x.data.length;N++)x.data[N].forEach(R);x.data.splice(0,1)}else x.data.forEach(R)}function F(R,W){for(var Y=u.header?{}:[],L=0;L<R.length;L++){var q=L,D=R[L],D=((fe,C)=>(z=>(u.dynamicTypingFunction&&u.dynamicTyping[z]===void 0&&(u.dynamicTyping[z]=u.dynamicTypingFunction(z)),(u.dynamicTyping[z]||u.dynamicTyping)===!0))(fe)?C==="true"||C==="TRUE"||C!=="false"&&C!=="FALSE"&&((z=>{if(le.test(z)&&(z=parseFloat(z),J<z&&z<k))return 1})(C)?parseFloat(C):ce.test(C)?new Date(C):C===""?null:C):C)(q=u.header?L>=A.length?"__parsed_extra":A[L]:q,D=u.transform?u.transform(D,q):D);q==="__parsed_extra"?(Y[q]=Y[q]||[],Y[q].push(D)):Y[q]=D}return u.header&&(L>A.length?ue("FieldMismatch","TooManyFields","Too many fields: expected "+A.length+" fields but parsed "+L,E+W):L<A.length&&ue("FieldMismatch","TooFewFields","Too few fields: expected "+A.length+" fields but parsed "+L,E+W)),Y}var B;x&&(u.header||u.dynamicTyping||u.transform)&&(B=1,!x.data.length||Array.isArray(x.data[0])?(x.data=x.data.map(F),B=x.data.length):x.data=F(x.data,0),u.header&&x.meta&&(x.meta.fields=A),E+=B)}function Z(){return u.header&&A.length===0}function ue(N,F,B,R){N={type:N,code:F,message:B},R!==void 0&&(N.row=R),x.errors.push(N)}I(u.step)&&(v=u.step,u.step=function(N){x=N,Z()?V():(V(),x.data.length!==0&&(U+=N.data.length,u.preview&&U>u.preview?p.abort():(x.data=x.data[0],v(x,j))))}),this.parse=function(N,F,B){var R=u.quoteChar||'"',R=(u.newline||(u.newline=this.guessLineEndings(N,R)),b=!1,u.delimiter?I(u.delimiter)&&(u.delimiter=u.delimiter(N),x.meta.delimiter=u.delimiter):((R=((W,Y,L,q,D)=>{var fe,C,z,Te;D=D||[",","	","|",";",a.RECORD_SEP,a.UNIT_SEP];for(var We=0;We<D.length;We++){for(var ye,rt=D[We],ne=0,be=0,X=0,ie=(z=void 0,new H({comments:q,delimiter:rt,newline:Y,preview:10}).parse(W)),we=0;we<ie.data.length;we++)L&&K(ie.data[we])?X++:(ye=ie.data[we].length,be+=ye,z===void 0?z=ye:0<ye&&(ne+=Math.abs(ye-z),z=ye));0<ie.data.length&&(be/=ie.data.length-X),(C===void 0||ne<=C)&&(Te===void 0||Te<be)&&1.99<be&&(C=ne,fe=rt,Te=be)}return{successful:!!(u.delimiter=fe),bestDelimiter:fe}})(N,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=R.bestDelimiter:(b=!0,u.delimiter=a.DefaultDelimiter),x.meta.delimiter=u.delimiter),Me(u));return u.preview&&u.header&&R.preview++,d=N,p=new H(R),x=p.parse(d,F,B),V(),te?{meta:{paused:!0}}:x||{meta:{paused:!1}}},this.paused=function(){return te},this.pause=function(){te=!0,p.abort(),d=I(u.chunk)?"":d.substring(p.getCharIndex())},this.resume=function(){j.streamer._halted?(te=!1,j.streamer.parseChunk(d,!0)):setTimeout(j.resume,3)},this.aborted=function(){return S},this.abort=function(){S=!0,p.abort(),x.meta.aborted=!0,I(u.complete)&&u.complete(x),d=""},this.guessLineEndings=function(W,R){W=W.substring(0,1048576);var R=new RegExp(M(R)+"([^]*?)"+M(R),"gm"),B=(W=W.replace(R,"")).split("\r"),R=W.split(`
`),W=1<R.length&&R[0].length<B[0].length;if(B.length===1||W)return`
`;for(var Y=0,L=0;L<B.length;L++)B[L][0]===`
`&&Y++;return Y>=B.length/2?`\r
`:"\r"}}function M(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function H(u){var d=(u=u||{}).delimiter,p=u.newline,b=u.comments,v=u.step,k=u.preview,J=u.fastMode,le=null,ce=!1,j=u.quoteChar==null?'"':u.quoteChar,U=j;if(u.escapeChar!==void 0&&(U=u.escapeChar),(typeof d!="string"||-1<a.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<a.BAD_DELIMITERS.indexOf(b))&&(b=!1),p!==`
`&&p!=="\r"&&p!==`\r
`&&(p=`
`);var E=0,te=!1;this.parse=function(S,A,x){if(typeof S!="string")throw new Error("Input must be a string");var K=S.length,V=d.length,Z=p.length,ue=b.length,N=I(v),F=[],B=[],R=[],W=E=0;if(!S)return ne();if(J||J!==!1&&S.indexOf(j)===-1){for(var Y=S.split(p),L=0;L<Y.length;L++){if(R=Y[L],E+=R.length,L!==Y.length-1)E+=p.length;else if(x)return ne();if(!b||R.substring(0,ue)!==b){if(N){if(F=[],Te(R.split(d)),be(),te)return ne()}else Te(R.split(d));if(k&&k<=L)return F=F.slice(0,k),ne(!0)}}return ne()}for(var q=S.indexOf(d,E),D=S.indexOf(p,E),fe=new RegExp(M(U)+M(j),"g"),C=S.indexOf(j,E);;)if(S[E]===j)for(C=E,E++;;){if((C=S.indexOf(j,C+1))===-1)return x||B.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:F.length,index:E}),ye();if(C===K-1)return ye(S.substring(E,C).replace(fe,j));if(j===U&&S[C+1]===U)C++;else if(j===U||C===0||S[C-1]!==U){q!==-1&&q<C+1&&(q=S.indexOf(d,C+1));var z=We((D=D!==-1&&D<C+1?S.indexOf(p,C+1):D)===-1?q:Math.min(q,D));if(S.substr(C+1+z,V)===d){R.push(S.substring(E,C).replace(fe,j)),S[E=C+1+z+V]!==j&&(C=S.indexOf(j,E)),q=S.indexOf(d,E),D=S.indexOf(p,E);break}if(z=We(D),S.substring(C+1+z,C+1+z+Z)===p){if(R.push(S.substring(E,C).replace(fe,j)),rt(C+1+z+Z),q=S.indexOf(d,E),C=S.indexOf(j,E),N&&(be(),te))return ne();if(k&&F.length>=k)return ne(!0);break}B.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:F.length,index:E}),C++}}else if(b&&R.length===0&&S.substring(E,E+ue)===b){if(D===-1)return ne();E=D+Z,D=S.indexOf(p,E),q=S.indexOf(d,E)}else if(q!==-1&&(q<D||D===-1))R.push(S.substring(E,q)),E=q+V,q=S.indexOf(d,E);else{if(D===-1)break;if(R.push(S.substring(E,D)),rt(D+Z),N&&(be(),te))return ne();if(k&&F.length>=k)return ne(!0)}return ye();function Te(X){F.push(X),W=E}function We(X){var ie=0;return ie=X!==-1&&(X=S.substring(C+1,X))&&X.trim()===""?X.length:ie}function ye(X){return x||(X===void 0&&(X=S.substring(E)),R.push(X),E=K,Te(R),N&&be()),ne()}function rt(X){E=X,Te(R),R=[],D=S.indexOf(p,E)}function ne(X){if(u.header&&!A&&F.length&&!ce){var ie=F[0],we=Object.create(null),St=new Set(ie);let Nt=!1;for(let Ve=0;Ve<ie.length;Ve++){let ve=ie[Ve];if(we[ve=I(u.transformHeader)?u.transformHeader(ve,Ve):ve]){let st,Dt=we[ve];for(;st=ve+"_"+Dt,Dt++,St.has(st););St.add(st),ie[Ve]=st,we[ve]++,Nt=!0,(le=le===null?{}:le)[st]=ve}else we[ve]=1,ie[Ve]=ve;St.add(ve)}Nt&&console.warn("Duplicate headers found and renamed."),ce=!0}return{data:F,errors:B,meta:{delimiter:d,linebreak:p,aborted:te,truncated:!!X,cursor:W+(A||0),renamedHeaders:le}}}function be(){v(ne()),F=[],B=[]}},this.abort=function(){te=!0},this.getCharIndex=function(){return E}}function ae(u){var d=u.data,p=c[d.workerId],b=!1;if(d.error)p.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,Oe(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:oe,resume:oe};if(I(p.userStep)){for(var k=0;k<d.results.data.length&&(p.userStep({data:d.results.data[k],errors:d.results.errors,meta:d.results.meta},v),!b);k++);delete d.results}else I(p.userChunk)&&(p.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&Oe(d.workerId,d.results)}function Oe(u,d){var p=c[u];I(p.userComplete)&&p.userComplete(d),p.terminate(),delete c[u]}function oe(){throw new Error("Not implemented.")}function Me(u){if(typeof u!="object"||u===null)return u;var d,p=Array.isArray(u)?[]:{};for(d in u)p[d]=Me(u[d]);return p}function he(u,d){return function(){u.apply(d,arguments)}}function I(u){return typeof u=="function"}return a.parse=function(u,d){var p=(d=d||{}).dynamicTyping||!1;if(I(p)&&(d.dynamicTypingFunction=p,p={}),d.dynamicTyping=p,d.transform=!!I(d.transform)&&d.transform,!d.worker||!a.WORKERS_SUPPORTED)return p=null,a.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),p=new(d.download?g:y)(d)):u.readable===!0&&I(u.read)&&I(u.on)?p=new $(d):(n.File&&u instanceof File||u instanceof Object)&&(p=new m(d)),p.stream(u);(p=(()=>{var b;return!!a.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,k=r.toString();return a.BLOB_URL||(a.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",k,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=ae,b.id=l++,c[b.id]=b)})()).userStep=d.step,p.userChunk=d.chunk,p.userComplete=d.complete,p.userError=d.error,d.step=I(d.step),d.chunk=I(d.chunk),d.complete=I(d.complete),d.error=I(d.error),delete d.worker,p.postMessage({input:u,config:d,workerId:p.id})},a.unparse=function(u,d){var p=!1,b=!0,v=",",k=`\r
`,J='"',le=J+J,ce=!1,j=null,U=!1,E=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||a.BAD_DELIMITERS.filter(function(A){return d.delimiter.indexOf(A)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(p=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(ce=d.skipEmptyLines),typeof d.newline=="string"&&(k=d.newline),typeof d.quoteChar=="string"&&(J=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");j=d.columns}d.escapeChar!==void 0&&(le=d.escapeChar+J),d.escapeFormulae instanceof RegExp?U=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(U=/^[=+\-@\t\r].*$/)}})(),new RegExp(M(J),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return te(null,u,ce);if(typeof u[0]=="object")return te(j||Object.keys(u[0]),u,ce)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||j),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),te(u.fields||[],u.data||[],ce);throw new Error("Unable to serialize unrecognized input");function te(A,x,K){var V="",Z=(typeof A=="string"&&(A=JSON.parse(A)),typeof x=="string"&&(x=JSON.parse(x)),Array.isArray(A)&&0<A.length),ue=!Array.isArray(x[0]);if(Z&&b){for(var N=0;N<A.length;N++)0<N&&(V+=v),V+=S(A[N],N);0<x.length&&(V+=k)}for(var F=0;F<x.length;F++){var B=(Z?A:x[F]).length,R=!1,W=Z?Object.keys(x[F]).length===0:x[F].length===0;if(K&&!Z&&(R=K==="greedy"?x[F].join("").trim()==="":x[F].length===1&&x[F][0].length===0),K==="greedy"&&Z){for(var Y=[],L=0;L<B;L++){var q=ue?A[L]:L;Y.push(x[F][q])}R=Y.join("").trim()===""}if(!R){for(var D=0;D<B;D++){0<D&&!W&&(V+=v);var fe=Z&&ue?A[D]:D;V+=S(x[F][fe],D)}F<x.length-1&&(!K||0<B&&!W)&&(V+=k)}}return V}function S(A,x){var K,V;return A==null?"":A.constructor===Date?JSON.stringify(A).slice(1,25):(V=!1,U&&typeof A=="string"&&U.test(A)&&(A="'"+A,V=!0),K=A.toString().replace(E,le),(V=V||p===!0||typeof p=="function"&&p(A,x)||Array.isArray(p)&&p[x]||((Z,ue)=>{for(var N=0;N<ue.length;N++)if(-1<Z.indexOf(ue[N]))return!0;return!1})(K,a.BAD_DELIMITERS)||-1<K.indexOf(v)||K.charAt(0)===" "||K.charAt(K.length-1)===" ")?J+K+J:K)}},a.RECORD_SEP="",a.UNIT_SEP="",a.BYTE_ORDER_MARK="\uFEFF",a.BAD_DELIMITERS=["\r",`
`,'"',a.BYTE_ORDER_MARK],a.WORKERS_SUPPORTED=!s&&!!n.Worker,a.NODE_STREAM_INPUT=1,a.LocalChunkSize=10485760,a.RemoteChunkSize=5242880,a.DefaultDelimiter=",",a.Parser=H,a.ParserHandle=O,a.NetworkStreamer=g,a.FileStreamer=m,a.StringStreamer=y,a.ReadableStreamStreamer=$,n.jQuery&&((i=n.jQuery).fn.parse=function(u){var d=u.config||{},p=[];return this.each(function(k){if(!(i(this).prop("tagName").toUpperCase()==="INPUT"&&i(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var J=0;J<this.files.length;J++)p.push({file:this.files[J],inputElem:this,instanceConfig:i.extend({},d)})}),b(),this;function b(){if(p.length===0)I(u.complete)&&u.complete();else{var k,J,le,ce,j=p[0];if(I(u.before)){var U=u.before(j.file,j.inputElem);if(typeof U=="object"){if(U.action==="abort")return k="AbortError",J=j.file,le=j.inputElem,ce=U.reason,void(I(u.error)&&u.error({name:k},J,le,ce));if(U.action==="skip")return void v();typeof U.config=="object"&&(j.instanceConfig=i.extend(j.instanceConfig,U.config))}else if(U==="skip")return void v()}var E=j.instanceConfig.complete;j.instanceConfig.complete=function(te){I(E)&&E(te,j.file,j.inputElem),v()},a.parse(j.file,j.instanceConfig)}}function v(){p.splice(0,1),b()}}),o&&(n.onmessage=function(u){u=u.data,a.WORKER_ID===void 0&&u&&(a.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:a.WORKER_ID,results:a.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=a.parse(u.input,u.config))&&n.postMessage({workerId:a.WORKER_ID,results:u,finished:!0})}),(g.prototype=Object.create(h.prototype)).constructor=g,(m.prototype=Object.create(h.prototype)).constructor=m,(y.prototype=Object.create(y.prototype)).constructor=y,($.prototype=Object.create(h.prototype)).constructor=$,a})})(xt)),xt.exports}var pr=fr();const mr=dr(pr);function gr(e){const t=mr.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:r=>r.trim()});return t.errors.length>0&&console.warn("CSV parsing warnings:",t.errors.slice(0,5)),t.data}function yr(e){if(e.length===0)return{};const t=Object.keys(e[0]),r={};for(const n of t){const i=e.slice(0,Math.min(100,e.length)).map(s=>s[n]);r[n]=br(i)}return r}function br(e){const t=e.filter(s=>s!=null&&s!=="");if(t.length===0)return"string";if(t.filter(s=>typeof s=="number").length===t.length)return"number";if(t.filter(s=>typeof s=="boolean").length===t.length)return"boolean";const i=t.filter(s=>{if(typeof s=="string"){const o=Date.parse(s);return!isNaN(o)}return!1}).length;return i===t.length&&i>0?"date":"string"}function vr(e,t){const r=[];for(const n of e){const i=n.name.toLowerCase();if(!((i.endsWith("id")||i.endsWith("_id")||i==="id")&&n.type==="number"))continue;const o=n.name.replace(/[_-]?id$/i,""),c=[`${o}Name`,`${o}_name`,`${o}name`,`${o.toLowerCase()}name`,`${o}`];for(const l of c){const a=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(a){const h=n.unique_count/t,g=a.unique_count/t;let m=.5;Math.abs(h-g)<.2?m=.9:Math.abs(h-g)<.4&&(m=.7),r.push({id_column:n.name,name_column:a.name,confidence:m});break}}}return r.filter(n=>n.confidence>=.5)}function xr(e,t){if(t.length===0)return e;const r=new Map;for(const n of t){const i=new Map;for(const s of e){const o=s[n.id_column],c=s[n.name_column];o!=null&&c&&i.set(o,c)}r.set(n.id_column,i)}return e.map(n=>{const i={...n};for(const s of t){const o=i[s.id_column],c=r.get(s.id_column);c&&c.has(o)&&(i[`${s.id_column}_original`]=o,i[s.id_column]=c.get(o))}return i})}const yn=new Be;yn.post("/",async e=>{try{const r=(await e.req.formData()).get("file");if(!r)return e.json({error:"No file provided"},400);const n=r.name,i=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!i)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(r.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const s=await r.text();let o;if(i==="csv")o=gr(s);else try{const m=JSON.parse(s);o=Array.isArray(m)?m:[m]}catch{return e.json({error:"Invalid JSON format"},400)}if(o.length===0)return e.json({error:"File contains no data"},400);if(o.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=yr(o),l=Object.keys(o[0]).map(m=>({name:m,type:c[m]||"string",nullable:o.some(y=>y[m]===null||y[m]===void 0||y[m]===""),unique_count:new Set(o.map(y=>y[m])).size,sample_values:o.slice(0,3).map(y=>y[m])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,i,o.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id;for(let m=0;m<o.length;m++)await e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,m,JSON.stringify(o[m]),0).run();console.log("Detecting column mappings...");const g=vr(l,o.length);console.log(`Detected ${g.length} column mappings`);for(const m of g)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,m.id_column,m.name_column).run(),console.log(`  Mapped: ${m.id_column} -> ${m.name_column} (confidence: ${m.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:o.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Be;nt.get("/",async e=>{try{const r=(await e.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all()).results.map(n=>({...n,columns:JSON.parse(n.columns)}));return e.json({datasets:r})}catch{return e.json({error:"Failed to fetch datasets"},500)}});nt.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const i=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(t).all()).results.map(s=>JSON.parse(s.data));return e.json({dataset:{...r,columns:JSON.parse(r.columns)},sample:i})}catch{return e.json({error:"Failed to fetch dataset"},500)}});nt.get("/:id/analyses",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(t).all()).results.map(i=>({...i,result:JSON.parse(i.result)}));return e.json({analyses:n})}catch{return e.json({error:"Failed to fetch analyses"},500)}});nt.get("/:id/visualizations",async e=>{try{const t=e.req.param("id"),n=(await e.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(t).all()).results.map(i=>({...i,config:JSON.parse(i.config)}));return e.json({visualizations:n})}catch{return e.json({error:"Failed to fetch visualizations"},500)}});nt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function wr(e,t){const r=e.filter(s=>s!=null&&s!==""),n=e.length-r.length,i=new Set(r).size;if(t==="number"){const s=r.map(o=>Number(o)).filter(o=>!isNaN(o));return{count:e.length,mean:Ie(s),median:_r(s),mode:Ht(s),stdDev:Er(s),min:Math.min(...s),max:Math.max(...s),q1:ct(s,25),q2:ct(s,50),q3:ct(s,75),nullCount:n,uniqueCount:i}}return{count:e.length,mode:Ht(r),min:r[0],max:r[r.length-1],nullCount:n,uniqueCount:i}}function Ie(e){return e.length===0?0:e.reduce((t,r)=>t+r,0)/e.length}function _r(e){if(e.length===0)return 0;const t=[...e].sort((n,i)=>n-i),r=Math.floor(t.length/2);return t.length%2===0?(t[r-1]+t[r])/2:t[r]}function Ht(e){if(e.length===0)return null;const t={};let r=0,n=null;for(const i of e){const s=String(i);t[s]=(t[s]||0)+1,t[s]>r&&(r=t[s],n=i)}return n}function Er(e){if(e.length===0)return 0;const t=Ie(e),r=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Ie(r))}function ct(e,t){if(e.length===0)return 0;const r=[...e].sort((c,l)=>c-l),n=t/100*(r.length-1),i=Math.floor(n),s=Math.ceil(n),o=n%1;return i===s?r[i]:r[i]*(1-o)+r[s]*o}function Rr(e){if(e.length<4)return{indices:[],threshold:0};const t=ct(e,25),r=ct(e,75),n=r-t,i=t-1.5*n,s=r+1.5*n,o=[];return e.forEach((c,l)=>{(c<i||c>s)&&o.push(l)}),{indices:o,threshold:n}}function Sr(e,t){if(e.length!==t.length||e.length===0)return 0;const r=e.length,n=Ie(e),i=Ie(t);let s=0,o=0,c=0;for(let l=0;l<r;l++){const a=e[l]-n,h=t[l]-i;s+=a*h,o+=a*a,c+=h*h}return o===0||c===0?0:s/Math.sqrt(o*c)}function Cr(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,r=Array.from({length:t},(a,h)=>h),n=Ie(r),i=Ie(e);let s=0,o=0;for(let a=0;a<t;a++)s+=(r[a]-n)*(e[a]-i),o+=Math.pow(r[a]-n,2);const c=o===0?0:s/o,l=Math.min(Math.abs(c)/(Ie(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function at(e,t,r,n){var o;let i=50;const s=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(i-=30,s.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(i-=25,s.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(i-=30,s.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(i-=20,s.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(i-=40,s.push("All values are identical")):n.uniqueCount===n.count?(i-=35,s.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(i-=25,s.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(i+=20,s.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(i+=15,s.push("High variability in data"));break;case"correlation":const c=Math.abs(r.correlation||0);c>.8?(i+=30,s.push("Very strong correlation")):c>.6?(i+=20,s.push("Strong correlation")):c>.5&&(i+=10,s.push("Moderate correlation"));break;case"outlier":const a=(r.count||0)/(n.count||1);a>.05&&a<.2?(i+=25,s.push("Significant outliers detected")):a>0&&(i+=10,s.push("Some outliers present"));break;case"pattern":const h=(o=r.topPatterns)==null?void 0:o[0];if(h){const[,m]=h,y=m/n.count;y>.3&&y<.9&&(i+=20,s.push("Clear dominant pattern"))}break;case"trend":const g=r.strength||0;g>.5?(i+=30,s.push("Strong trend detected")):g>.3&&(i+=15,s.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(i-=30,s.push("More than 50% missing data")):c>.2&&(i-=15,s.push("Significant missing data"))}return i=Math.max(0,Math.min(100,i)),{score:i,reasons:s}}async function Or(e,t,r,n){console.log(`Starting analysis for dataset ${e}`);for(const s of r){const o=t.map(g=>g[s.name]),c=wr(o,s.type),l=Tr(s.name,s.type,c),a=jr(c,s.type),h=at("statistics",s.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",s.name,JSON.stringify(c),1,l,a,h.score).run(),s.type==="number"){const g=o.map(y=>Number(y)).filter(y=>!isNaN(y)),m=Rr(g);if(m.indices.length>0){const y=`Found ${m.indices.length} unusual values in "${s.name}" (${(m.indices.length/g.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,$={count:m.indices.length,indices:m.indices.slice(0,10)},O=at("outlier",s.name,$,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",s.name,JSON.stringify($),.85,y,m.indices.length>g.length*.05?"high":"medium",O.score).run()}if(g.length>5){const y=Cr(g);if(y.direction!=="stable"){const $=`"${s.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,O=at("trend",s.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",s.name,JSON.stringify(y),y.strength,$,y.strength>.5?"high":"medium",O.score).run()}}}}const i=r.filter(s=>s.type==="number");for(let s=0;s<i.length;s++)for(let o=s+1;o<i.length;o++){const c=i[s],l=i[o],a=t.map(g=>Number(g[c.name])).filter(g=>!isNaN(g)),h=t.map(g=>Number(g[l.name])).filter(g=>!isNaN(g));if(a.length>5&&h.length>5){const g=Sr(a,h);if(Math.abs(g)>.5){const m=kr(c.name,l.name,g),y={column1:c.name,column2:l.name,correlation:g},$=at("correlation",void 0,y,{count:a.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(g),m,Math.abs(g)>.7?"high":"medium",$.score).run()}}}for(const s of r)if(s.type==="string"){const o=t.map(h=>h[s.name]).filter(h=>h),c={};o.forEach(h=>{c[h]=(c[h]||0)+1});const a=Object.entries(c).sort((h,g)=>g[1]-h[1]).slice(0,5);if(a.length>0&&a[0][1]>o.length*.1){const h=`The most common value in "${s.name}" is "${a[0][0]}" appearing ${a[0][1]} times (${(a[0][1]/o.length*100).toFixed(1)}% of records).`,g={topPatterns:a},m={count:o.length,uniqueCount:new Set(o).size},y=at("pattern",s.name,g,m);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",s.name,JSON.stringify(g),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Tr(e,t,r){var n,i,s,o;return t==="number"?`"${e}" ranges from ${(n=r.min)==null?void 0:n.toFixed(2)} to ${(i=r.max)==null?void 0:i.toFixed(2)} with an average of ${(s=r.mean)==null?void 0:s.toFixed(2)}. About half the values are below ${(o=r.median)==null?void 0:o.toFixed(2)}.`:`"${e}" contains ${r.count} values with ${r.uniqueCount} unique entries. Most common: "${r.mode}".`}function kr(e,t,r){const n=Math.abs(r)>.7?"strong":"moderate";return r>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${r.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${r.toFixed(2)}).`}function jr(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function Ar(e,t,r,n){console.log(`Generating visualizations for dataset ${e}`);const i=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),s=new Map;i.results.forEach(l=>{s.set(l.id_column,l.name_column)});let o=0;const c=[...r].sort((l,a)=>(a.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const a=await Nr(l,t,s);a&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,a.chartType,a.title,JSON.stringify(a.config),a.explanation,o++).run()}console.log(`Generated ${o} visualizations`)}function Nr(e,t,r){switch(e.analysis_type){case"statistics":return Dr(e,t,r);case"correlation":return $r(e,t,r);case"outlier":return Ir(e,t,r);case"pattern":return Mr(e,t,r);case"trend":return Fr(e,t,r);default:return null}}function Dr(e,t,r){const n=e.column_name;if(!n)return null;const i=e.result,s=r.has(n)?` (via ${r.get(n)})`:"";if(i.mean!==void 0){const a=t.map(g=>Number(g[n])).filter(g=>!isNaN(g)),h=Pr(a);return{chartType:"bar",title:`Distribution: ${n}${s}`,explanation:`This histogram shows how values in "${n}" are distributed${s?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const o=t.map(a=>a[n]).filter(a=>a!=null),c={};o.forEach(a=>{c[String(a)]=(c[String(a)]||0)+1});const l=Object.entries(c).sort((a,h)=>h[1]-a[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${s}`,explanation:`This chart shows the most common values in "${n}"${s?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([a])=>a),datasets:[{label:"Count",data:l.map(([,a])=>a),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function $r(e,t,r){const n=e.result,i=n.column1,s=n.column2;if(!i||!s)return null;const o=r.has(i)?` (via ${r.get(i)})`:"",c=r.has(s)?` (via ${r.get(s)})`:"",l=t.map(g=>({x:Number(g[i]),y:Number(g[s])})).filter(g=>!isNaN(g.x)&&!isNaN(g.y)),a=n.correlation,h=a>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${i}${o} vs ${s}${c}`,explanation:`Each dot represents one record${o||c?" using human-readable names":""}. ${a>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${i} vs ${s}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${a.toFixed(2)}`}},scales:{x:{title:{display:!0,text:i}},y:{title:{display:!0,text:s}}}}}}}function Ir(e,t,r){const n=e.column_name;if(!n)return null;const i=r.has(n)?` (via ${r.get(n)})`:"",s=new Set(e.result.indices||[]),o=t.map((a,h)=>({x:h,y:Number(a[n]),isOutlier:s.has(h)})).filter(a=>!isNaN(a.y)),c=o.filter(a=>!a.isOutlier),l=o.filter(a=>a.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${i}`,explanation:`Red dots are unusual values that stand out from the pattern${i?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Mr(e,t,r){const n=e.column_name;if(!n)return null;const i=r.has(n)?` (via ${r.get(n)})`:"",s=e.result.topPatterns||[];if(s.length===0)return null;const o=s.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${i}`,explanation:`Each slice shows what percentage of records have that value${i?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:o.map(([c])=>c),datasets:[{data:o.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Fr(e,t,r){const n=e.column_name;if(!n)return null;const i=r.has(n)?` (via ${r.get(n)})`:"",s=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),o=e.result,c=o.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${i}`,explanation:`This line shows how "${n}" changes over time${i?" using human-readable names":""}. ${o.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:s.map((l,a)=>`#${a+1}`),datasets:[{label:n,data:s,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${o.direction==="up"?"↗":"↘"} ${Math.round(o.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function Pr(e,t=10){if(e.length===0)return{labels:[],data:[]};const r=Math.min(...e),s=(Math.max(...e)-r)/t,o=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const a=r+l*s,h=r+(l+1)*s;c.push(`${a.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let a=Math.floor((l-r)/s);a>=t&&(a=t-1),a<0&&(a=0),o[a]++}),{labels:c,data:o}}const bn=new Be;bn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);let i=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(a=>JSON.parse(a.data));const s=JSON.parse(r.columns),o=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(o.results.length>0){const a=o.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${a.length} column mappings for human-readable analysis...`),i=xr(i,a);for(const h of a){const g=s.find(m=>m.name===h.id_column);g&&(g.enriched_by=h.name_column)}}await Or(t,i,s,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(a=>({...a,result:JSON.parse(a.result)}));return await Ar(t,i,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const vn=new Be;vn.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const n=JSON.parse(r.columns),s=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(m=>({...m,result:JSON.parse(m.result)})),o=[],c=[],l=new Map;for(const m of n){const y=`col_${m.name}`;if(!l.has(y)){const O=10+m.unique_count/r.row_count*30;o.push({id:y,label:m.name,type:"column",size:O}),l.set(y,!0)}}const a=s.filter(m=>m.analysis_type==="correlation"),h=a.sort((m,y)=>Math.abs(y.result.correlation)-Math.abs(m.result.correlation)).slice(0,Math.min(50,a.length));for(const m of h){const{column1:y,column2:$,correlation:O}=m.result,M=`col_${y}`,H=`col_${$}`;n.length>50&&Math.abs(O)<.7||c.push({source:M,target:H,type:"correlation",strength:Math.abs(O),label:`${O>0?"+":""}${O.toFixed(2)}`})}const g=s.filter(m=>m.analysis_type==="pattern"&&(m.quality_score||0)>50);for(const m of g){const y=m.column_name;if(!y)continue;const{topPatterns:$}=m.result;if(!$||$.length===0)continue;const O=$.slice(0,3);for(const[M,H]of O){const ae=`val_${y}_${M}`;l.has(ae)||(o.push({id:ae,label:String(M),type:"value",size:5+H/r.row_count*20}),l.set(ae,!0)),c.push({source:`col_${y}`,target:ae,type:"contains",strength:H/r.row_count,label:`${H}x`})}}return e.json({nodes:o,edges:c,dataset_name:r.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const Rt=new Be;Rt.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),r=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:r.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});Rt.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});Rt.post("/",async e=>{try{const{dataset_id:t,id_column:r,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,r,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const xe=new Be;xe.use("/api/*",er());xe.use("/static/*",ur({root:"./public"}));xe.route("/api/upload",yn);xe.route("/api/datasets",nt);xe.route("/api/analyze",bn);xe.route("/api/relationships",vn);xe.route("/api/mappings",Rt);xe.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));xe.get("/",e=>e.html(`
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
                                           onkeyup="filterInsights(this.value)"
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
    </body>
    </html>
  `));const zt=new Be,Lr=Object.assign({"/src/index.tsx":xe});let xn=!1;for(const[,e]of Object.entries(Lr))e&&(zt.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),zt.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),xn=!0);if(!xn)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{zt as default};
