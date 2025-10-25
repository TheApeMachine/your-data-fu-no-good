var En=Object.defineProperty;var Dt=e=>{throw TypeError(e)};var Rn=(e,t,r)=>t in e?En(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var R=(e,t,r)=>Rn(e,typeof t!="symbol"?t+"":t,r),Ot=(e,t,r)=>t.has(e)||Dt("Cannot "+r);var f=(e,t,r)=>(Ot(e,t,"read from private field"),r?r.call(e):t.get(e)),k=(e,t,r)=>t.has(e)?Dt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),E=(e,t,r,n)=>(Ot(e,t,"write to private field"),n?n.call(e,r):t.set(e,r),r),F=(e,t,r)=>(Ot(e,t,"access private method"),r);var Mt=(e,t,r,n)=>({set _(s){E(e,t,s,r)},get _(){return f(e,t,n)}});var Pt=(e,t,r)=>(n,s)=>{let a=-1;return i(0);async function i(c){if(c<=a)throw new Error("next() called multiple times");a=c;let l,o=!1,h;if(e[c]?(h=e[c][0][0],n.req.routeIndex=c):h=c===e.length&&s||void 0,h)try{l=await h(n,()=>i(c+1))}catch(p){if(p instanceof Error&&t)n.error=p,l=await t(p,n),o=!0;else throw p}else n.finalized===!1&&r&&(l=await r(n));return l&&(n.finalized===!1||o)&&(n.res=l),n}},Sn=Symbol(),Cn=async(e,t=Object.create(null))=>{const{all:r=!1,dot:n=!1}=t,a=(e instanceof sn?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?On(e,{all:r,dot:n}):{}};async function On(e,t){const r=await e.formData();return r?Tn(r,t):{}}function Tn(e,t){const r=Object.create(null);return e.forEach((n,s)=>{t.all||s.endsWith("[]")?kn(r,s,n):r[s]=n}),t.dot&&Object.entries(r).forEach(([n,s])=>{n.includes(".")&&(An(r,n,s),delete r[n])}),r}var kn=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},An=(e,t,r)=>{let n=e;const s=t.split(".");s.forEach((a,i)=>{i===s.length-1?n[a]=r:((!n[a]||typeof n[a]!="object"||Array.isArray(n[a])||n[a]instanceof File)&&(n[a]=Object.create(null)),n=n[a])})},Zt=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},jn=e=>{const{groups:t,path:r}=In(e),n=Zt(r);return $n(n,t)},In=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,n)=>{const s=`@${n}`;return t.push([s,r]),s}),{groups:t,path:e}},$n=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[n]=t[r];for(let s=e.length-1;s>=0;s--)if(e[s].includes(n)){e[s]=e[s].replace(n,t[r][1]);break}}return e},yt={},Nn=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const n=`${e}#${t}`;return yt[n]||(r[2]?yt[n]=t&&t[0]!==":"&&t[0]!=="*"?[n,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:yt[n]=[e,r[1],!0]),yt[n]}return null},It=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},Dn=e=>It(e,decodeURI),en=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let n=r;for(;n<t.length;n++){const s=t.charCodeAt(n);if(s===37){const a=t.indexOf("?",n),i=t.slice(r,a===-1?void 0:a);return Dn(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(s===63)break}return t.slice(r,n)},Mn=e=>{const t=en(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Ke=(e,t,...r)=>(r.length&&(t=Ke(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tn=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let n="";return t.forEach(s=>{if(s!==""&&!/\:/.test(s))n+="/"+s;else if(/\:/.test(s))if(/\?/.test(s)){r.length===0&&n===""?r.push("/"):r.push(n);const a=s.replace("?","");n+="/"+a,r.push(n)}else n+="/"+s}),r.filter((s,a,i)=>i.indexOf(s)===a)},Tt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?It(e,rn):e):e,nn=(e,t,r)=>{let n;if(!r&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const c=e.charCodeAt(i+t.length+1);if(c===61){const l=i+t.length+2,o=e.indexOf("&",l);return Tt(e.slice(l,o===-1?void 0:o))}else if(c==38||isNaN(c))return"";i=e.indexOf(`&${t}`,i+1)}if(n=/[%+]/.test(e),!n)return}const s={};n??(n=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const i=e.indexOf("&",a+1);let c=e.indexOf("=",a);c>i&&i!==-1&&(c=-1);let l=e.slice(a+1,c===-1?i===-1?void 0:i:c);if(n&&(l=Tt(l)),a=i,l==="")continue;let o;c===-1?o="":(o=e.slice(c+1,i===-1?void 0:i),n&&(o=Tt(o))),r?(s[l]&&Array.isArray(s[l])||(s[l]=[]),s[l].push(o)):s[l]??(s[l]=o)}return t?s[t]:s},Pn=nn,Fn=(e,t)=>nn(e,t,!0),rn=decodeURIComponent,Ft=e=>It(e,rn),Qe,fe,Te,an,on,At,Ae,Ut,sn=(Ut=class{constructor(e,t="/",r=[[]]){k(this,Te);R(this,"raw");k(this,Qe);k(this,fe);R(this,"routeIndex",0);R(this,"path");R(this,"bodyCache",{});k(this,Ae,e=>{const{bodyCache:t,raw:r}=this,n=t[e];if(n)return n;const s=Object.keys(t)[0];return s?t[s].then(a=>(s==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,E(this,fe,r),E(this,Qe,{})}param(e){return e?F(this,Te,an).call(this,e):F(this,Te,on).call(this)}query(e){return Pn(this.url,e)}queries(e){return Fn(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,n)=>{t[n]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Cn(this,e))}json(){return f(this,Ae).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,Ae).call(this,"text")}arrayBuffer(){return f(this,Ae).call(this,"arrayBuffer")}blob(){return f(this,Ae).call(this,"blob")}formData(){return f(this,Ae).call(this,"formData")}addValidatedData(e,t){f(this,Qe)[e]=t}valid(e){return f(this,Qe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Sn](){return f(this,fe)}get matchedRoutes(){return f(this,fe)[0].map(([[,e]])=>e)}get routePath(){return f(this,fe)[0].map(([[,e]])=>e)[this.routeIndex].path}},Qe=new WeakMap,fe=new WeakMap,Te=new WeakSet,an=function(e){const t=f(this,fe)[0][this.routeIndex][1][e],r=F(this,Te,At).call(this,t);return r&&/\%/.test(r)?Ft(r):r},on=function(){const e={},t=Object.keys(f(this,fe)[0][this.routeIndex][1]);for(const r of t){const n=F(this,Te,At).call(this,f(this,fe)[0][this.routeIndex][1][r]);n!==void 0&&(e[r]=/\%/.test(n)?Ft(n):n)}return e},At=function(e){return f(this,fe)[1]?f(this,fe)[1][e]:e},Ae=new WeakMap,Ut),Ln={Stringify:1},ln=async(e,t,r,n,s)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(s?s[0]+=e:s=[e],Promise.all(a.map(c=>c({phase:t,buffer:s,context:n}))).then(c=>Promise.all(c.filter(Boolean).map(l=>ln(l,t,!1,n,s))).then(()=>s[0]))):Promise.resolve(e)},qn="text/plain; charset=UTF-8",kt=(e,t)=>({"Content-Type":e,...t}),dt,ht,Re,Xe,Se,oe,ft,Ze,et,qe,pt,mt,je,Ye,Wt,Hn=(Wt=class{constructor(e,t){k(this,je);k(this,dt);k(this,ht);R(this,"env",{});k(this,Re);R(this,"finalized",!1);R(this,"error");k(this,Xe);k(this,Se);k(this,oe);k(this,ft);k(this,Ze);k(this,et);k(this,qe);k(this,pt);k(this,mt);R(this,"render",(...e)=>(f(this,Ze)??E(this,Ze,t=>this.html(t)),f(this,Ze).call(this,...e)));R(this,"setLayout",e=>E(this,ft,e));R(this,"getLayout",()=>f(this,ft));R(this,"setRenderer",e=>{E(this,Ze,e)});R(this,"header",(e,t,r)=>{this.finalized&&E(this,oe,new Response(f(this,oe).body,f(this,oe)));const n=f(this,oe)?f(this,oe).headers:f(this,qe)??E(this,qe,new Headers);t===void 0?n.delete(e):r!=null&&r.append?n.append(e,t):n.set(e,t)});R(this,"status",e=>{E(this,Xe,e)});R(this,"set",(e,t)=>{f(this,Re)??E(this,Re,new Map),f(this,Re).set(e,t)});R(this,"get",e=>f(this,Re)?f(this,Re).get(e):void 0);R(this,"newResponse",(...e)=>F(this,je,Ye).call(this,...e));R(this,"body",(e,t,r)=>F(this,je,Ye).call(this,e,t,r));R(this,"text",(e,t,r)=>!f(this,qe)&&!f(this,Xe)&&!t&&!r&&!this.finalized?new Response(e):F(this,je,Ye).call(this,e,t,kt(qn,r)));R(this,"json",(e,t,r)=>F(this,je,Ye).call(this,JSON.stringify(e),t,kt("application/json",r)));R(this,"html",(e,t,r)=>{const n=s=>F(this,je,Ye).call(this,s,t,kt("text/html; charset=UTF-8",r));return typeof e=="object"?ln(e,Ln.Stringify,!1,{}).then(n):n(e)});R(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});R(this,"notFound",()=>(f(this,et)??E(this,et,()=>new Response),f(this,et).call(this,this)));E(this,dt,e),t&&(E(this,Se,t.executionCtx),this.env=t.env,E(this,et,t.notFoundHandler),E(this,mt,t.path),E(this,pt,t.matchResult))}get req(){return f(this,ht)??E(this,ht,new sn(f(this,dt),f(this,mt),f(this,pt))),f(this,ht)}get event(){if(f(this,Se)&&"respondWith"in f(this,Se))return f(this,Se);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,Se))return f(this,Se);throw Error("This context has no ExecutionContext")}get res(){return f(this,oe)||E(this,oe,new Response(null,{headers:f(this,qe)??E(this,qe,new Headers)}))}set res(e){if(f(this,oe)&&e){e=new Response(e.body,e);for(const[t,r]of f(this,oe).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const n=f(this,oe).headers.getSetCookie();e.headers.delete("set-cookie");for(const s of n)e.headers.append("set-cookie",s)}else e.headers.set(t,r)}E(this,oe,e),this.finalized=!0}get var(){return f(this,Re)?Object.fromEntries(f(this,Re)):{}}},dt=new WeakMap,ht=new WeakMap,Re=new WeakMap,Xe=new WeakMap,Se=new WeakMap,oe=new WeakMap,ft=new WeakMap,Ze=new WeakMap,et=new WeakMap,qe=new WeakMap,pt=new WeakMap,mt=new WeakMap,je=new WeakSet,Ye=function(e,t,r){const n=f(this,oe)?new Headers(f(this,oe).headers):f(this,qe)??new Headers;if(typeof t=="object"&&"headers"in t){const a=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,c]of a)i.toLowerCase()==="set-cookie"?n.append(i,c):n.set(i,c)}if(r)for(const[a,i]of Object.entries(r))if(typeof i=="string")n.set(a,i);else{n.delete(a);for(const c of i)n.append(a,c)}const s=typeof t=="number"?t:(t==null?void 0:t.status)??f(this,Xe);return new Response(e,{status:s,headers:n})},Wt),Q="ALL",zn="all",Bn=["get","post","put","delete","options","patch"],cn="Can not add a route since the matcher is already built.",un=class extends Error{},Un="__COMPOSED_HANDLER",Wn=e=>e.text("404 Not Found",404),Lt=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},me,X,hn,ge,Fe,bt,vt,Vt,dn=(Vt=class{constructor(t={}){k(this,X);R(this,"get");R(this,"post");R(this,"put");R(this,"delete");R(this,"options");R(this,"patch");R(this,"all");R(this,"on");R(this,"use");R(this,"router");R(this,"getPath");R(this,"_basePath","/");k(this,me,"/");R(this,"routes",[]);k(this,ge,Wn);R(this,"errorHandler",Lt);R(this,"onError",t=>(this.errorHandler=t,this));R(this,"notFound",t=>(E(this,ge,t),this));R(this,"fetch",(t,...r)=>F(this,X,vt).call(this,t,r[1],r[0],t.method));R(this,"request",(t,r,n,s)=>t instanceof Request?this.fetch(r?new Request(t,r):t,n,s):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Ke("/",t)}`,r),n,s)));R(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(F(this,X,vt).call(this,t.request,t,void 0,t.request.method))})});[...Bn,zn].forEach(a=>{this[a]=(i,...c)=>(typeof i=="string"?E(this,me,i):F(this,X,Fe).call(this,a,f(this,me),i),c.forEach(l=>{F(this,X,Fe).call(this,a,f(this,me),l)}),this)}),this.on=(a,i,...c)=>{for(const l of[i].flat()){E(this,me,l);for(const o of[a].flat())c.map(h=>{F(this,X,Fe).call(this,o.toUpperCase(),f(this,me),h)})}return this},this.use=(a,...i)=>(typeof a=="string"?E(this,me,a):(E(this,me,"*"),i.unshift(a)),i.forEach(c=>{F(this,X,Fe).call(this,Q,f(this,me),c)}),this);const{strict:n,...s}=t;Object.assign(this,s),this.getPath=n??!0?t.getPath??en:Mn}route(t,r){const n=this.basePath(t);return r.routes.map(s=>{var i;let a;r.errorHandler===Lt?a=s.handler:(a=async(c,l)=>(await Pt([],r.errorHandler)(c,()=>s.handler(c,l))).res,a[Un]=s.handler),F(i=n,X,Fe).call(i,s.method,s.path,a)}),this}basePath(t){const r=F(this,X,hn).call(this);return r._basePath=Ke(this._basePath,t),r}mount(t,r,n){let s,a;n&&(typeof n=="function"?a=n:(a=n.optionHandler,n.replaceRequest===!1?s=l=>l:s=n.replaceRequest));const i=a?l=>{const o=a(l);return Array.isArray(o)?o:[o]}:l=>{let o;try{o=l.executionCtx}catch{}return[l.env,o]};s||(s=(()=>{const l=Ke(this._basePath,t),o=l==="/"?0:l.length;return h=>{const p=new URL(h.url);return p.pathname=p.pathname.slice(o)||"/",new Request(p,h)}})());const c=async(l,o)=>{const h=await r(s(l.req.raw),...i(l));if(h)return h;await o()};return F(this,X,Fe).call(this,Q,Ke(t,"*"),c),this}},me=new WeakMap,X=new WeakSet,hn=function(){const t=new dn({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,E(t,ge,f(this,ge)),t.routes=this.routes,t},ge=new WeakMap,Fe=function(t,r,n){t=t.toUpperCase(),r=Ke(this._basePath,r);const s={basePath:this._basePath,path:r,method:t,handler:n};this.router.add(t,r,[n,s]),this.routes.push(s)},bt=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},vt=function(t,r,n,s){if(s==="HEAD")return(async()=>new Response(null,await F(this,X,vt).call(this,t,r,n,"GET")))();const a=this.getPath(t,{env:n}),i=this.router.match(s,a),c=new Hn(t,{path:a,matchResult:i,env:n,executionCtx:r,notFoundHandler:f(this,ge)});if(i[0].length===1){let o;try{o=i[0][0][0][0](c,async()=>{c.res=await f(this,ge).call(this,c)})}catch(h){return F(this,X,bt).call(this,h,c)}return o instanceof Promise?o.then(h=>h||(c.finalized?c.res:f(this,ge).call(this,c))).catch(h=>F(this,X,bt).call(this,h,c)):o??f(this,ge).call(this,c)}const l=Pt(i[0],this.errorHandler,f(this,ge));return(async()=>{try{const o=await l(c);if(!o.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return o.res}catch(o){return F(this,X,bt).call(this,o,c)}})()},Vt),fn=[];function Vn(e,t){const r=this.buildAllMatchers(),n=(s,a)=>{const i=r[s]||r[Q],c=i[2][a];if(c)return c;const l=a.match(i[0]);if(!l)return[[],fn];const o=l.indexOf("",1);return[i[1][o],l]};return this.match=n,n(e,t)}var _t="[^/]+",lt=".*",ct="(?:|/.*)",Ge=Symbol(),Jn=new Set(".\\+*[^]$()");function Kn(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===lt||e===ct?1:t===lt||t===ct?-1:e===_t?1:t===_t?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var He,ze,ye,Jt,jt=(Jt=class{constructor(){k(this,He);k(this,ze);k(this,ye,Object.create(null))}insert(t,r,n,s,a){if(t.length===0){if(f(this,He)!==void 0)throw Ge;if(a)return;E(this,He,r);return}const[i,...c]=t,l=i==="*"?c.length===0?["","",lt]:["","",_t]:i==="/*"?["","",ct]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let o;if(l){const h=l[1];let p=l[2]||_t;if(h&&l[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw Ge;if(o=f(this,ye)[p],!o){if(Object.keys(f(this,ye)).some(g=>g!==lt&&g!==ct))throw Ge;if(a)return;o=f(this,ye)[p]=new jt,h!==""&&E(o,ze,s.varIndex++)}!a&&h!==""&&n.push([h,f(o,ze)])}else if(o=f(this,ye)[i],!o){if(Object.keys(f(this,ye)).some(h=>h.length>1&&h!==lt&&h!==ct))throw Ge;if(a)return;o=f(this,ye)[i]=new jt}o.insert(c,r,n,s,a)}buildRegExpStr(){const r=Object.keys(f(this,ye)).sort(Kn).map(n=>{const s=f(this,ye)[n];return(typeof f(s,ze)=="number"?`(${n})@${f(s,ze)}`:Jn.has(n)?`\\${n}`:n)+s.buildRegExpStr()});return typeof f(this,He)=="number"&&r.unshift(`#${f(this,He)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},He=new WeakMap,ze=new WeakMap,ye=new WeakMap,Jt),Et,gt,Kt,Yn=(Kt=class{constructor(){k(this,Et,{varIndex:0});k(this,gt,new jt)}insert(e,t,r){const n=[],s=[];for(let i=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const o=`@\\${i}`;return s[i]=[o,l],i++,c=!0,o}),!c)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=s.length-1;i>=0;i--){const[c]=s[i];for(let l=a.length-1;l>=0;l--)if(a[l].indexOf(c)!==-1){a[l]=a[l].replace(c,s[i][1]);break}}return f(this,gt).insert(a,t,n,f(this,Et),r),n}buildRegExp(){let e=f(this,gt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],n=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(s,a,i)=>a!==void 0?(r[++t]=Number(a),"$()"):(i!==void 0&&(n[Number(i)]=++t),"")),[new RegExp(`^${e}`),r,n]}},Et=new WeakMap,gt=new WeakMap,Kt),Gn=[/^$/,[],Object.create(null)],xt=Object.create(null);function pn(e){return xt[e]??(xt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Qn(){xt=Object.create(null)}function Xn(e){var o;const t=new Yn,r=[];if(e.length===0)return Gn;const n=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,p],[g,y])=>h?1:g?-1:p.length-y.length),s=Object.create(null);for(let h=0,p=-1,g=n.length;h<g;h++){const[y,x,_]=n[h];y?s[x]=[_.map(([L])=>[L,Object.create(null)]),fn]:p++;let D;try{D=t.insert(x,p,y)}catch(L){throw L===Ge?new un(x):L}y||(r[p]=_.map(([L,Z])=>{const ce=Object.create(null);for(Z-=1;Z>=0;Z--){const[re,_e]=D[Z];ce[re]=_e}return[L,ce]}))}const[a,i,c]=t.buildRegExp();for(let h=0,p=r.length;h<p;h++)for(let g=0,y=r[h].length;g<y;g++){const x=(o=r[h][g])==null?void 0:o[1];if(!x)continue;const _=Object.keys(x);for(let D=0,L=_.length;D<L;D++)x[_[D]]=c[x[_[D]]]}const l=[];for(const h in i)l[h]=r[i[h]];return[a,l,s]}function Je(e,t){if(e){for(const r of Object.keys(e).sort((n,s)=>s.length-n.length))if(pn(r).test(t))return[...e[r]]}}var Ie,$e,Rt,mn,Yt,Zn=(Yt=class{constructor(){k(this,Rt);R(this,"name","RegExpRouter");k(this,Ie);k(this,$e);R(this,"match",Vn);E(this,Ie,{[Q]:Object.create(null)}),E(this,$e,{[Q]:Object.create(null)})}add(e,t,r){var c;const n=f(this,Ie),s=f(this,$e);if(!n||!s)throw new Error(cn);n[e]||[n,s].forEach(l=>{l[e]=Object.create(null),Object.keys(l[Q]).forEach(o=>{l[e][o]=[...l[Q][o]]})}),t==="/*"&&(t="*");const a=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=pn(t);e===Q?Object.keys(n).forEach(o=>{var h;(h=n[o])[t]||(h[t]=Je(n[o],t)||Je(n[Q],t)||[])}):(c=n[e])[t]||(c[t]=Je(n[e],t)||Je(n[Q],t)||[]),Object.keys(n).forEach(o=>{(e===Q||e===o)&&Object.keys(n[o]).forEach(h=>{l.test(h)&&n[o][h].push([r,a])})}),Object.keys(s).forEach(o=>{(e===Q||e===o)&&Object.keys(s[o]).forEach(h=>l.test(h)&&s[o][h].push([r,a]))});return}const i=tn(t)||[t];for(let l=0,o=i.length;l<o;l++){const h=i[l];Object.keys(s).forEach(p=>{var g;(e===Q||e===p)&&((g=s[p])[h]||(g[h]=[...Je(n[p],h)||Je(n[Q],h)||[]]),s[p][h].push([r,a-o+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(f(this,$e)).concat(Object.keys(f(this,Ie))).forEach(t=>{e[t]||(e[t]=F(this,Rt,mn).call(this,t))}),E(this,Ie,E(this,$e,void 0)),Qn(),e}},Ie=new WeakMap,$e=new WeakMap,Rt=new WeakSet,mn=function(e){const t=[];let r=e===Q;return[f(this,Ie),f(this,$e)].forEach(n=>{const s=n[e]?Object.keys(n[e]).map(a=>[a,n[e][a]]):[];s.length!==0?(r||(r=!0),t.push(...s)):e!==Q&&t.push(...Object.keys(n[Q]).map(a=>[a,n[Q][a]]))}),r?Xn(t):null},Yt),Ne,Ce,Gt,er=(Gt=class{constructor(e){R(this,"name","SmartRouter");k(this,Ne,[]);k(this,Ce,[]);E(this,Ne,e.routers)}add(e,t,r){if(!f(this,Ce))throw new Error(cn);f(this,Ce).push([e,t,r])}match(e,t){if(!f(this,Ce))throw new Error("Fatal error");const r=f(this,Ne),n=f(this,Ce),s=r.length;let a=0,i;for(;a<s;a++){const c=r[a];try{for(let l=0,o=n.length;l<o;l++)c.add(...n[l]);i=c.match(e,t)}catch(l){if(l instanceof un)continue;throw l}this.match=c.match.bind(c),E(this,Ne,[c]),E(this,Ce,void 0);break}if(a===s)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(f(this,Ce)||f(this,Ne).length!==1)throw new Error("No active router has been determined yet.");return f(this,Ne)[0]}},Ne=new WeakMap,Ce=new WeakMap,Gt),at=Object.create(null),De,ie,Be,tt,ne,Oe,Le,Qt,gn=(Qt=class{constructor(e,t,r){k(this,Oe);k(this,De);k(this,ie);k(this,Be);k(this,tt,0);k(this,ne,at);if(E(this,ie,r||Object.create(null)),E(this,De,[]),e&&t){const n=Object.create(null);n[e]={handler:t,possibleKeys:[],score:0},E(this,De,[n])}E(this,Be,[])}insert(e,t,r){E(this,tt,++Mt(this,tt)._);let n=this;const s=jn(t),a=[];for(let i=0,c=s.length;i<c;i++){const l=s[i],o=s[i+1],h=Nn(l,o),p=Array.isArray(h)?h[0]:l;if(p in f(n,ie)){n=f(n,ie)[p],h&&a.push(h[1]);continue}f(n,ie)[p]=new gn,h&&(f(n,Be).push(h),a.push(h[1])),n=f(n,ie)[p]}return f(n,De).push({[e]:{handler:r,possibleKeys:a.filter((i,c,l)=>l.indexOf(i)===c),score:f(this,tt)}}),n}search(e,t){var c;const r=[];E(this,ne,at);let s=[this];const a=Zt(t),i=[];for(let l=0,o=a.length;l<o;l++){const h=a[l],p=l===o-1,g=[];for(let y=0,x=s.length;y<x;y++){const _=s[y],D=f(_,ie)[h];D&&(E(D,ne,f(_,ne)),p?(f(D,ie)["*"]&&r.push(...F(this,Oe,Le).call(this,f(D,ie)["*"],e,f(_,ne))),r.push(...F(this,Oe,Le).call(this,D,e,f(_,ne)))):g.push(D));for(let L=0,Z=f(_,Be).length;L<Z;L++){const ce=f(_,Be)[L],re=f(_,ne)===at?{}:{...f(_,ne)};if(ce==="*"){const m=f(_,ie)["*"];m&&(r.push(...F(this,Oe,Le).call(this,m,e,f(_,ne))),E(m,ne,re),g.push(m));continue}const[_e,z,M]=ce;if(!h&&!(M instanceof RegExp))continue;const u=f(_,ie)[_e],d=a.slice(l).join("/");if(M instanceof RegExp){const m=M.exec(d);if(m){if(re[z]=m[0],r.push(...F(this,Oe,Le).call(this,u,e,f(_,ne),re)),Object.keys(f(u,ie)).length){E(u,ne,re);const b=((c=m[0].match(/\//))==null?void 0:c.length)??0;(i[b]||(i[b]=[])).push(u)}continue}}(M===!0||M.test(h))&&(re[z]=h,p?(r.push(...F(this,Oe,Le).call(this,u,e,re,f(_,ne))),f(u,ie)["*"]&&r.push(...F(this,Oe,Le).call(this,f(u,ie)["*"],e,re,f(_,ne)))):(E(u,ne,re),g.push(u)))}}s=g.concat(i.shift()??[])}return r.length>1&&r.sort((l,o)=>l.score-o.score),[r.map(({handler:l,params:o})=>[l,o])]}},De=new WeakMap,ie=new WeakMap,Be=new WeakMap,tt=new WeakMap,ne=new WeakMap,Oe=new WeakSet,Le=function(e,t,r,n){const s=[];for(let a=0,i=f(e,De).length;a<i;a++){const c=f(e,De)[a],l=c[t]||c[Q],o={};if(l!==void 0&&(l.params=Object.create(null),s.push(l),r!==at||n&&n!==at))for(let h=0,p=l.possibleKeys.length;h<p;h++){const g=l.possibleKeys[h],y=o[l.score];l.params[g]=n!=null&&n[g]&&!y?n[g]:r[g]??(n==null?void 0:n[g]),o[l.score]=!0}}return s},Qt),Ue,Xt,tr=(Xt=class{constructor(){R(this,"name","TrieRouter");k(this,Ue);E(this,Ue,new gn)}add(e,t,r){const n=tn(t);if(n){for(let s=0,a=n.length;s<a;s++)f(this,Ue).insert(e,n[s],r);return}f(this,Ue).insert(e,t,r)}match(e,t){return f(this,Ue).search(e,t)}},Ue=new WeakMap,Xt),Pe=class extends dn{constructor(e={}){super(e),this.router=e.router??new er({routers:[new Zn,new tr]})}},nr=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},n=(a=>typeof a=="string"?a==="*"?()=>a:i=>a===i?i:null:typeof a=="function"?a:i=>a.includes(i)?i:null)(r.origin),s=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(r.allowMethods);return async function(i,c){var h;function l(p,g){i.res.headers.set(p,g)}const o=await n(i.req.header("origin")||"",i);if(o&&l("Access-Control-Allow-Origin",o),r.origin!=="*"){const p=i.req.header("Vary");p?l("Vary",p):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),i.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const p=await s(i.req.header("origin")||"",i);p.length&&l("Access-Control-Allow-Methods",p.join(","));let g=r.allowHeaders;if(!(g!=null&&g.length)){const y=i.req.header("Access-Control-Request-Headers");y&&(g=y.split(/\s*,\s*/))}return g!=null&&g.length&&(l("Access-Control-Allow-Headers",g.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await c()}},rr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,qt=(e,t=ar)=>{const r=/\.([a-zA-Z0-9]+?)$/,n=e.match(r);if(!n)return;let s=t[n[1]];return s&&s.startsWith("text")&&(s+="; charset=utf-8"),s},sr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ar=sr,ir=(...e)=>{let t=e.filter(s=>s!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),n=[];for(const s of r)s===".."&&n.length>0&&n.at(-1)!==".."?n.pop():s!=="."&&n.push(s);return n.join("/")||"."},yn={br:".br",zstd:".zst",gzip:".gz"},or=Object.keys(yn),lr="index.html",cr=e=>{const t=e.root??"./",r=e.path,n=e.join??ir;return async(s,a)=>{var h,p,g,y;if(s.finalized)return a();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(s.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((h=e.onNotFound)==null?void 0:h.call(e,s.req.path,s)),a()}let c=n(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(c)&&(c=n(c,lr));const l=e.getContent;let o=await l(c,s);if(o instanceof Response)return s.newResponse(o.body,o);if(o){const x=e.mimes&&qt(c,e.mimes)||qt(c);if(s.header("Content-Type",x||"application/octet-stream"),e.precompressed&&(!x||rr.test(x))){const _=new Set((p=s.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(D=>D.trim()));for(const D of or){if(!_.has(D))continue;const L=await l(c+yn[D],s);if(L){o=L,s.header("Content-Encoding",D),s.header("Vary","Accept-Encoding",{append:!0});break}}}return await((g=e.onFound)==null?void 0:g.call(e,c,s)),s.body(o)}await((y=e.onNotFound)==null?void 0:y.call(e,c,s)),await a()}},ur=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let n;t&&t.namespace?n=t.namespace:n=__STATIC_CONTENT;const s=r[e]||e;if(!s)return null;const a=await n.get(s,{type:"stream"});return a||null},dr=e=>async function(r,n){return cr({...e,getContent:async a=>ur(a,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,n)},hr=e=>dr(e);function fr(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var wt={exports:{}};/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/var pr=wt.exports,Ht;function mr(){return Ht||(Ht=1,(function(e,t){((r,n)=>{e.exports=n()})(pr,function r(){var n=typeof self<"u"?self:typeof window<"u"?window:n!==void 0?n:{},s,a=!n.document&&!!n.postMessage,i=n.IS_PAPA_WORKER||!1,c={},l=0,o={};function h(u){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(d){var m=_e(d);m.chunkSize=parseInt(m.chunkSize),d.step||d.chunk||(m.chunkSize=null),this._handle=new _(m),(this._handle.streamer=this)._config=m}).call(this,u),this.parseChunk=function(d,m){var b=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<b){let A=this._config.newline;A||(v=this._config.quoteChar||'"',A=this._handle.guessLineEndings(d,v)),d=[...d.split(A).slice(b)].join(A)}this.isFirstChunk&&M(this._config.beforeFirstChunk)&&(v=this._config.beforeFirstChunk(d))!==void 0&&(d=v),this.isFirstChunk=!1,this._halted=!1;var b=this._partialLine+d,v=(this._partialLine="",this._handle.parse(b,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(d=v.meta.cursor,b=(this._finished||(this._partialLine=b.substring(d-this._baseIndex),this._baseIndex=d),v&&v.data&&(this._rowCount+=v.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),i)n.postMessage({results:v,workerId:o.WORKER_ID,finished:b});else if(M(this._config.chunk)&&!m){if(this._config.chunk(v,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=v=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(v.data),this._completeResults.errors=this._completeResults.errors.concat(v.errors),this._completeResults.meta=v.meta),this._completed||!b||!M(this._config.complete)||v&&v.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),b||v&&v.meta.paused||this._nextChunk(),v}this._halted=!0},this._sendError=function(d){M(this._config.error)?this._config.error(d):i&&this._config.error&&n.postMessage({workerId:o.WORKER_ID,error:d,finished:!1})}}function p(u){var d;(u=u||{}).chunkSize||(u.chunkSize=o.RemoteChunkSize),h.call(this,u),this._nextChunk=a?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(m){this._input=m,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(d=new XMLHttpRequest,this._config.withCredentials&&(d.withCredentials=this._config.withCredentials),a||(d.onload=z(this._chunkLoaded,this),d.onerror=z(this._chunkError,this)),d.open(this._config.downloadRequestBody?"POST":"GET",this._input,!a),this._config.downloadRequestHeaders){var m,b=this._config.downloadRequestHeaders;for(m in b)d.setRequestHeader(m,b[m])}var v;this._config.chunkSize&&(v=this._start+this._config.chunkSize-1,d.setRequestHeader("Range","bytes="+this._start+"-"+v));try{d.send(this._config.downloadRequestBody)}catch(A){this._chunkError(A.message)}a&&d.status===0&&this._chunkError()}},this._chunkLoaded=function(){d.readyState===4&&(d.status<200||400<=d.status?this._chunkError():(this._start+=this._config.chunkSize||d.responseText.length,this._finished=!this._config.chunkSize||this._start>=(m=>(m=m.getResponseHeader("Content-Range"))!==null?parseInt(m.substring(m.lastIndexOf("/")+1)):-1)(d),this.parseChunk(d.responseText)))},this._chunkError=function(m){m=d.statusText||m,this._sendError(new Error(m))}}function g(u){(u=u||{}).chunkSize||(u.chunkSize=o.LocalChunkSize),h.call(this,u);var d,m,b=typeof FileReader<"u";this.stream=function(v){this._input=v,m=v.slice||v.webkitSlice||v.mozSlice,b?((d=new FileReader).onload=z(this._chunkLoaded,this),d.onerror=z(this._chunkError,this)):d=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var v=this._input,A=(this._config.chunkSize&&(A=Math.min(this._start+this._config.chunkSize,this._input.size),v=m.call(v,this._start,A)),d.readAsText(v,this._config.encoding));b||this._chunkLoaded({target:{result:A}})},this._chunkLoaded=function(v){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(v.target.result)},this._chunkError=function(){this._sendError(d.error)}}function y(u){var d;h.call(this,u=u||{}),this.stream=function(m){return d=m,this._nextChunk()},this._nextChunk=function(){var m,b;if(!this._finished)return m=this._config.chunkSize,d=m?(b=d.substring(0,m),d.substring(m)):(b=d,""),this._finished=!d,this.parseChunk(b)}}function x(u){h.call(this,u=u||{});var d=[],m=!0,b=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(v){this._input=v,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){b&&d.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),d.length?this.parseChunk(d.shift()):m=!0},this._streamData=z(function(v){try{d.push(typeof v=="string"?v:v.toString(this._config.encoding)),m&&(m=!1,this._checkIsFinished(),this.parseChunk(d.shift()))}catch(A){this._streamError(A)}},this),this._streamError=z(function(v){this._streamCleanUp(),this._sendError(v)},this),this._streamEnd=z(function(){this._streamCleanUp(),b=!0,this._streamData("")},this),this._streamCleanUp=z(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function _(u){var d,m,b,v,A=Math.pow(2,53),K=-A,ue=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,de=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,j=this,U=0,S=0,se=!1,O=!1,I=[],w={data:[],errors:[],meta:{}};function Y($){return u.skipEmptyLines==="greedy"?$.join("").trim()==="":$.length===1&&$[0].length===0}function J(){if(w&&b&&(he("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+o.DefaultDelimiter+"'"),b=!1),u.skipEmptyLines&&(w.data=w.data.filter(function(C){return!Y(C)})),te()){let C=function(V,G){M(u.transformHeader)&&(V=u.transformHeader(V,G)),I.push(V)};if(w)if(Array.isArray(w.data[0])){for(var $=0;te()&&$<w.data.length;$++)w.data[$].forEach(C);w.data.splice(0,1)}else w.data.forEach(C)}function P(C,V){for(var G=u.header?{}:[],q=0;q<C.length;q++){var H=q,N=C[q],N=((pe,T)=>(B=>(u.dynamicTypingFunction&&u.dynamicTyping[B]===void 0&&(u.dynamicTyping[B]=u.dynamicTypingFunction(B)),(u.dynamicTyping[B]||u.dynamicTyping)===!0))(pe)?T==="true"||T==="TRUE"||T!=="false"&&T!=="FALSE"&&((B=>{if(ue.test(B)&&(B=parseFloat(B),K<B&&B<A))return 1})(T)?parseFloat(T):de.test(T)?new Date(T):T===""?null:T):T)(H=u.header?q>=I.length?"__parsed_extra":I[q]:H,N=u.transform?u.transform(N,H):N);H==="__parsed_extra"?(G[H]=G[H]||[],G[H].push(N)):G[H]=N}return u.header&&(q>I.length?he("FieldMismatch","TooManyFields","Too many fields: expected "+I.length+" fields but parsed "+q,S+V):q<I.length&&he("FieldMismatch","TooFewFields","Too few fields: expected "+I.length+" fields but parsed "+q,S+V)),G}var W;w&&(u.header||u.dynamicTyping||u.transform)&&(W=1,!w.data.length||Array.isArray(w.data[0])?(w.data=w.data.map(P),W=w.data.length):w.data=P(w.data,0),u.header&&w.meta&&(w.meta.fields=I),S+=W)}function te(){return u.header&&I.length===0}function he($,P,W,C){$={type:$,code:P,message:W},C!==void 0&&($.row=C),w.errors.push($)}M(u.step)&&(v=u.step,u.step=function($){w=$,te()?J():(J(),w.data.length!==0&&(U+=$.data.length,u.preview&&U>u.preview?m.abort():(w.data=w.data[0],v(w,j))))}),this.parse=function($,P,W){var C=u.quoteChar||'"',C=(u.newline||(u.newline=this.guessLineEndings($,C)),b=!1,u.delimiter?M(u.delimiter)&&(u.delimiter=u.delimiter($),w.meta.delimiter=u.delimiter):((C=((V,G,q,H,N)=>{var pe,T,B,ke;N=N||[",","	","|",";",o.RECORD_SEP,o.UNIT_SEP];for(var We=0;We<N.length;We++){for(var ve,rt=N[We],ae=0,xe=0,ee=0,le=(B=void 0,new L({comments:H,delimiter:rt,newline:G,preview:10}).parse(V)),Ee=0;Ee<le.data.length;Ee++)q&&Y(le.data[Ee])?ee++:(ve=le.data[Ee].length,xe+=ve,B===void 0?B=ve:0<ve&&(ae+=Math.abs(ve-B),B=ve));0<le.data.length&&(xe/=le.data.length-ee),(T===void 0||ae<=T)&&(ke===void 0||ke<xe)&&1.99<xe&&(T=ae,pe=rt,ke=xe)}return{successful:!!(u.delimiter=pe),bestDelimiter:pe}})($,u.newline,u.skipEmptyLines,u.comments,u.delimitersToGuess)).successful?u.delimiter=C.bestDelimiter:(b=!0,u.delimiter=o.DefaultDelimiter),w.meta.delimiter=u.delimiter),_e(u));return u.preview&&u.header&&C.preview++,d=$,m=new L(C),w=m.parse(d,P,W),J(),se?{meta:{paused:!0}}:w||{meta:{paused:!1}}},this.paused=function(){return se},this.pause=function(){se=!0,m.abort(),d=M(u.chunk)?"":d.substring(m.getCharIndex())},this.resume=function(){j.streamer._halted?(se=!1,j.streamer.parseChunk(d,!0)):setTimeout(j.resume,3)},this.aborted=function(){return O},this.abort=function(){O=!0,m.abort(),w.meta.aborted=!0,M(u.complete)&&u.complete(w),d=""},this.guessLineEndings=function(V,C){V=V.substring(0,1048576);var C=new RegExp(D(C)+"([^]*?)"+D(C),"gm"),W=(V=V.replace(C,"")).split("\r"),C=V.split(`
`),V=1<C.length&&C[0].length<W[0].length;if(W.length===1||V)return`
`;for(var G=0,q=0;q<W.length;q++)W[q][0]===`
`&&G++;return G>=W.length/2?`\r
`:"\r"}}function D(u){return u.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function L(u){var d=(u=u||{}).delimiter,m=u.newline,b=u.comments,v=u.step,A=u.preview,K=u.fastMode,ue=null,de=!1,j=u.quoteChar==null?'"':u.quoteChar,U=j;if(u.escapeChar!==void 0&&(U=u.escapeChar),(typeof d!="string"||-1<o.BAD_DELIMITERS.indexOf(d))&&(d=","),b===d)throw new Error("Comment character same as delimiter");b===!0?b="#":(typeof b!="string"||-1<o.BAD_DELIMITERS.indexOf(b))&&(b=!1),m!==`
`&&m!=="\r"&&m!==`\r
`&&(m=`
`);var S=0,se=!1;this.parse=function(O,I,w){if(typeof O!="string")throw new Error("Input must be a string");var Y=O.length,J=d.length,te=m.length,he=b.length,$=M(v),P=[],W=[],C=[],V=S=0;if(!O)return ae();if(K||K!==!1&&O.indexOf(j)===-1){for(var G=O.split(m),q=0;q<G.length;q++){if(C=G[q],S+=C.length,q!==G.length-1)S+=m.length;else if(w)return ae();if(!b||C.substring(0,he)!==b){if($){if(P=[],ke(C.split(d)),xe(),se)return ae()}else ke(C.split(d));if(A&&A<=q)return P=P.slice(0,A),ae(!0)}}return ae()}for(var H=O.indexOf(d,S),N=O.indexOf(m,S),pe=new RegExp(D(U)+D(j),"g"),T=O.indexOf(j,S);;)if(O[S]===j)for(T=S,S++;;){if((T=O.indexOf(j,T+1))===-1)return w||W.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:P.length,index:S}),ve();if(T===Y-1)return ve(O.substring(S,T).replace(pe,j));if(j===U&&O[T+1]===U)T++;else if(j===U||T===0||O[T-1]!==U){H!==-1&&H<T+1&&(H=O.indexOf(d,T+1));var B=We((N=N!==-1&&N<T+1?O.indexOf(m,T+1):N)===-1?H:Math.min(H,N));if(O.substr(T+1+B,J)===d){C.push(O.substring(S,T).replace(pe,j)),O[S=T+1+B+J]!==j&&(T=O.indexOf(j,S)),H=O.indexOf(d,S),N=O.indexOf(m,S);break}if(B=We(N),O.substring(T+1+B,T+1+B+te)===m){if(C.push(O.substring(S,T).replace(pe,j)),rt(T+1+B+te),H=O.indexOf(d,S),T=O.indexOf(j,S),$&&(xe(),se))return ae();if(A&&P.length>=A)return ae(!0);break}W.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:P.length,index:S}),T++}}else if(b&&C.length===0&&O.substring(S,S+he)===b){if(N===-1)return ae();S=N+te,N=O.indexOf(m,S),H=O.indexOf(d,S)}else if(H!==-1&&(H<N||N===-1))C.push(O.substring(S,H)),S=H+J,H=O.indexOf(d,S);else{if(N===-1)break;if(C.push(O.substring(S,N)),rt(N+te),$&&(xe(),se))return ae();if(A&&P.length>=A)return ae(!0)}return ve();function ke(ee){P.push(ee),V=S}function We(ee){var le=0;return le=ee!==-1&&(ee=O.substring(T+1,ee))&&ee.trim()===""?ee.length:le}function ve(ee){return w||(ee===void 0&&(ee=O.substring(S)),C.push(ee),S=Y,ke(C),$&&xe()),ae()}function rt(ee){S=ee,ke(C),C=[],N=O.indexOf(m,S)}function ae(ee){if(u.header&&!I&&P.length&&!de){var le=P[0],Ee=Object.create(null),Ct=new Set(le);let $t=!1;for(let Ve=0;Ve<le.length;Ve++){let we=le[Ve];if(Ee[we=M(u.transformHeader)?u.transformHeader(we,Ve):we]){let st,Nt=Ee[we];for(;st=we+"_"+Nt,Nt++,Ct.has(st););Ct.add(st),le[Ve]=st,Ee[we]++,$t=!0,(ue=ue===null?{}:ue)[st]=we}else Ee[we]=1,le[Ve]=we;Ct.add(we)}$t&&console.warn("Duplicate headers found and renamed."),de=!0}return{data:P,errors:W,meta:{delimiter:d,linebreak:m,aborted:se,truncated:!!ee,cursor:V+(I||0),renamedHeaders:ue}}}function xe(){v(ae()),P=[],W=[]}},this.abort=function(){se=!0},this.getCharIndex=function(){return S}}function Z(u){var d=u.data,m=c[d.workerId],b=!1;if(d.error)m.userError(d.error,d.file);else if(d.results&&d.results.data){var v={abort:function(){b=!0,ce(d.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:re,resume:re};if(M(m.userStep)){for(var A=0;A<d.results.data.length&&(m.userStep({data:d.results.data[A],errors:d.results.errors,meta:d.results.meta},v),!b);A++);delete d.results}else M(m.userChunk)&&(m.userChunk(d.results,v,d.file),delete d.results)}d.finished&&!b&&ce(d.workerId,d.results)}function ce(u,d){var m=c[u];M(m.userComplete)&&m.userComplete(d),m.terminate(),delete c[u]}function re(){throw new Error("Not implemented.")}function _e(u){if(typeof u!="object"||u===null)return u;var d,m=Array.isArray(u)?[]:{};for(d in u)m[d]=_e(u[d]);return m}function z(u,d){return function(){u.apply(d,arguments)}}function M(u){return typeof u=="function"}return o.parse=function(u,d){var m=(d=d||{}).dynamicTyping||!1;if(M(m)&&(d.dynamicTypingFunction=m,m={}),d.dynamicTyping=m,d.transform=!!M(d.transform)&&d.transform,!d.worker||!o.WORKERS_SUPPORTED)return m=null,o.NODE_STREAM_INPUT,typeof u=="string"?(u=(b=>b.charCodeAt(0)!==65279?b:b.slice(1))(u),m=new(d.download?p:y)(d)):u.readable===!0&&M(u.read)&&M(u.on)?m=new x(d):(n.File&&u instanceof File||u instanceof Object)&&(m=new g(d)),m.stream(u);(m=(()=>{var b;return!!o.WORKERS_SUPPORTED&&(b=(()=>{var v=n.URL||n.webkitURL||null,A=r.toString();return o.BLOB_URL||(o.BLOB_URL=v.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",A,")();"],{type:"text/javascript"})))})(),(b=new n.Worker(b)).onmessage=Z,b.id=l++,c[b.id]=b)})()).userStep=d.step,m.userChunk=d.chunk,m.userComplete=d.complete,m.userError=d.error,d.step=M(d.step),d.chunk=M(d.chunk),d.complete=M(d.complete),d.error=M(d.error),delete d.worker,m.postMessage({input:u,config:d,workerId:m.id})},o.unparse=function(u,d){var m=!1,b=!0,v=",",A=`\r
`,K='"',ue=K+K,de=!1,j=null,U=!1,S=((()=>{if(typeof d=="object"){if(typeof d.delimiter!="string"||o.BAD_DELIMITERS.filter(function(I){return d.delimiter.indexOf(I)!==-1}).length||(v=d.delimiter),typeof d.quotes!="boolean"&&typeof d.quotes!="function"&&!Array.isArray(d.quotes)||(m=d.quotes),typeof d.skipEmptyLines!="boolean"&&typeof d.skipEmptyLines!="string"||(de=d.skipEmptyLines),typeof d.newline=="string"&&(A=d.newline),typeof d.quoteChar=="string"&&(K=d.quoteChar),typeof d.header=="boolean"&&(b=d.header),Array.isArray(d.columns)){if(d.columns.length===0)throw new Error("Option columns is empty");j=d.columns}d.escapeChar!==void 0&&(ue=d.escapeChar+K),d.escapeFormulae instanceof RegExp?U=d.escapeFormulae:typeof d.escapeFormulae=="boolean"&&d.escapeFormulae&&(U=/^[=+\-@\t\r].*$/)}})(),new RegExp(D(K),"g"));if(typeof u=="string"&&(u=JSON.parse(u)),Array.isArray(u)){if(!u.length||Array.isArray(u[0]))return se(null,u,de);if(typeof u[0]=="object")return se(j||Object.keys(u[0]),u,de)}else if(typeof u=="object")return typeof u.data=="string"&&(u.data=JSON.parse(u.data)),Array.isArray(u.data)&&(u.fields||(u.fields=u.meta&&u.meta.fields||j),u.fields||(u.fields=Array.isArray(u.data[0])?u.fields:typeof u.data[0]=="object"?Object.keys(u.data[0]):[]),Array.isArray(u.data[0])||typeof u.data[0]=="object"||(u.data=[u.data])),se(u.fields||[],u.data||[],de);throw new Error("Unable to serialize unrecognized input");function se(I,w,Y){var J="",te=(typeof I=="string"&&(I=JSON.parse(I)),typeof w=="string"&&(w=JSON.parse(w)),Array.isArray(I)&&0<I.length),he=!Array.isArray(w[0]);if(te&&b){for(var $=0;$<I.length;$++)0<$&&(J+=v),J+=O(I[$],$);0<w.length&&(J+=A)}for(var P=0;P<w.length;P++){var W=(te?I:w[P]).length,C=!1,V=te?Object.keys(w[P]).length===0:w[P].length===0;if(Y&&!te&&(C=Y==="greedy"?w[P].join("").trim()==="":w[P].length===1&&w[P][0].length===0),Y==="greedy"&&te){for(var G=[],q=0;q<W;q++){var H=he?I[q]:q;G.push(w[P][H])}C=G.join("").trim()===""}if(!C){for(var N=0;N<W;N++){0<N&&!V&&(J+=v);var pe=te&&he?I[N]:N;J+=O(w[P][pe],N)}P<w.length-1&&(!Y||0<W&&!V)&&(J+=A)}}return J}function O(I,w){var Y,J;return I==null?"":I.constructor===Date?JSON.stringify(I).slice(1,25):(J=!1,U&&typeof I=="string"&&U.test(I)&&(I="'"+I,J=!0),Y=I.toString().replace(S,ue),(J=J||m===!0||typeof m=="function"&&m(I,w)||Array.isArray(m)&&m[w]||((te,he)=>{for(var $=0;$<he.length;$++)if(-1<te.indexOf(he[$]))return!0;return!1})(Y,o.BAD_DELIMITERS)||-1<Y.indexOf(v)||Y.charAt(0)===" "||Y.charAt(Y.length-1)===" ")?K+Y+K:Y)}},o.RECORD_SEP="",o.UNIT_SEP="",o.BYTE_ORDER_MARK="\uFEFF",o.BAD_DELIMITERS=["\r",`
`,'"',o.BYTE_ORDER_MARK],o.WORKERS_SUPPORTED=!a&&!!n.Worker,o.NODE_STREAM_INPUT=1,o.LocalChunkSize=10485760,o.RemoteChunkSize=5242880,o.DefaultDelimiter=",",o.Parser=L,o.ParserHandle=_,o.NetworkStreamer=p,o.FileStreamer=g,o.StringStreamer=y,o.ReadableStreamStreamer=x,n.jQuery&&((s=n.jQuery).fn.parse=function(u){var d=u.config||{},m=[];return this.each(function(A){if(!(s(this).prop("tagName").toUpperCase()==="INPUT"&&s(this).attr("type").toLowerCase()==="file"&&n.FileReader)||!this.files||this.files.length===0)return!0;for(var K=0;K<this.files.length;K++)m.push({file:this.files[K],inputElem:this,instanceConfig:s.extend({},d)})}),b(),this;function b(){if(m.length===0)M(u.complete)&&u.complete();else{var A,K,ue,de,j=m[0];if(M(u.before)){var U=u.before(j.file,j.inputElem);if(typeof U=="object"){if(U.action==="abort")return A="AbortError",K=j.file,ue=j.inputElem,de=U.reason,void(M(u.error)&&u.error({name:A},K,ue,de));if(U.action==="skip")return void v();typeof U.config=="object"&&(j.instanceConfig=s.extend(j.instanceConfig,U.config))}else if(U==="skip")return void v()}var S=j.instanceConfig.complete;j.instanceConfig.complete=function(se){M(S)&&S(se,j.file,j.inputElem),v()},o.parse(j.file,j.instanceConfig)}}function v(){m.splice(0,1),b()}}),i&&(n.onmessage=function(u){u=u.data,o.WORKER_ID===void 0&&u&&(o.WORKER_ID=u.workerId),typeof u.input=="string"?n.postMessage({workerId:o.WORKER_ID,results:o.parse(u.input,u.config),finished:!0}):(n.File&&u.input instanceof File||u.input instanceof Object)&&(u=o.parse(u.input,u.config))&&n.postMessage({workerId:o.WORKER_ID,results:u,finished:!0})}),(p.prototype=Object.create(h.prototype)).constructor=p,(g.prototype=Object.create(h.prototype)).constructor=g,(y.prototype=Object.create(y.prototype)).constructor=y,(x.prototype=Object.create(h.prototype)).constructor=x,o})})(wt)),wt.exports}var gr=mr();const yr=fr(gr);function br(e,t={}){const{maxRows:r=1e4}=t,n=yr.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0,transformHeader:s=>s.trim(),preview:r});return n.errors.length>0&&console.warn("CSV parsing warnings:",n.errors.slice(0,5)),n.data}function vr(e){if(e.length===0)return{};const t=Object.keys(e[0]),r={};for(const n of t){const s=e.slice(0,Math.min(100,e.length)).map(a=>a[n]);r[n]=xr(s)}return r}function xr(e){const t=e.filter(a=>a!=null&&a!=="");if(t.length===0)return"string";if(t.filter(a=>typeof a=="number"&&!isNaN(a)).length===t.length)return"number";if(t.filter(a=>typeof a=="boolean").length===t.length)return"boolean";const s=t.filter(a=>{if(typeof a=="string"){const i=Date.parse(a);return!isNaN(i)}return!1}).length;return s===t.length&&s>0?"date":"string"}function wr(e,t){const r=[];for(const n of e){const s=n.name.toLowerCase();if(!((s.endsWith("id")||s.endsWith("_id")||s==="id")&&n.type==="number"))continue;const i=n.name.replace(/[_-]?id$/i,""),c=[`${i}Name`,`${i}_name`,`${i}name`,`${i.toLowerCase()}name`,`${i}`];for(const l of c){const o=e.find(h=>h.name.toLowerCase()===l.toLowerCase()&&h.type==="string");if(o){const h=n.unique_count/t,p=o.unique_count/t;let g=.5;Math.abs(h-p)<.2?g=.9:Math.abs(h-p)<.4&&(g=.7),r.push({id_column:n.name,name_column:o.name,confidence:g});break}}}return r.filter(n=>n.confidence>=.5)}function _r(e,t){if(t.length===0)return e;const r=new Map;for(const n of t){const s=new Map;for(const a of e){const i=a[n.id_column],c=a[n.name_column];i!=null&&c&&s.set(i,c)}r.set(n.id_column,s)}return e.map(n=>{const s={...n};for(const a of t){const i=s[a.id_column],c=r.get(a.id_column);c&&c.has(i)&&(s[`${a.id_column}_original`]=i,s[a.id_column]=c.get(i))}return s})}const bn=new Pe;bn.post("/",async e=>{try{const r=(await e.req.formData()).get("file");if(!r)return e.json({error:"No file provided"},400);const n=r.name,s=n.endsWith(".csv")?"csv":n.endsWith(".json")?"json":null;if(!s)return e.json({error:"Unsupported file type. Please upload CSV or JSON."},400);if(r.size>5*1024*1024)return e.json({error:"File too large. Maximum size is 5MB."},400);const a=await r.text();let i;if(s==="csv")i=br(a);else try{const x=JSON.parse(a);i=Array.isArray(x)?x:[x]}catch{return e.json({error:"Invalid JSON format"},400)}if(i.length===0)return e.json({error:"File contains no data"},400);if(i.length>1e4)return e.json({error:"Dataset too large. Maximum 10,000 rows supported."},400);const c=vr(i),l=Object.keys(i[0]).map(x=>({name:x,type:c[x]||"string",nullable:i.some(_=>_[x]===null||_[x]===void 0||_[x]===""),unique_count:new Set(i.map(_=>_[x])).size,sample_values:i.slice(0,3).map(_=>_[x])})),h=(await e.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(n.replace(/\.[^.]+$/,""),n,s,i.length,l.length,JSON.stringify(l),"analyzing").run()).meta.last_row_id,p=i.map((x,_)=>e.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(h,_,JSON.stringify(x),0)),g=100;for(let x=0;x<p.length;x+=g){const _=p.slice(x,x+g);await e.env.DB.batch(_)}console.log("Detecting column mappings...");const y=wr(l,i.length);console.log(`Detected ${y.length} column mappings`);for(const x of y)await e.env.DB.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(h,x.id_column,x.name_column).run(),console.log(`  Mapped: ${x.id_column} -> ${x.name_column} (confidence: ${x.confidence})`);return e.json({success:!0,dataset_id:h,message:"Upload successful. Analysis started.",row_count:i.length,column_count:l.length,columns:l})}catch(t){return console.error("Upload error:",t),e.json({error:"Upload failed: "+t.message},500)}});const nt=new Pe;nt.get("/",async e=>{try{const r=(await e.env.DB.prepare(`
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
    `).bind(t).run(),e.json({success:!0,message:"Dataset deleted"})}catch{return e.json({error:"Failed to delete dataset"},500)}});function Er(e,t){const r=e.filter(a=>a!=null&&a!==""),n=e.length-r.length,s=new Set(r).size;if(t==="number"){const a=r.map(i=>Number(i)).filter(i=>!isNaN(i));return{count:e.length,mean:Me(a),median:Rr(a),mode:zt(a),stdDev:Sr(a),min:Math.min(...a),max:Math.max(...a),q1:ut(a,25),q2:ut(a,50),q3:ut(a,75),nullCount:n,uniqueCount:s}}return{count:e.length,mode:zt(r),min:r[0],max:r[r.length-1],nullCount:n,uniqueCount:s}}function Me(e){return e.length===0?0:e.reduce((t,r)=>t+r,0)/e.length}function Rr(e){if(e.length===0)return 0;const t=[...e].sort((n,s)=>n-s),r=Math.floor(t.length/2);return t.length%2===0?(t[r-1]+t[r])/2:t[r]}function zt(e){if(e.length===0)return null;const t={};let r=0,n=null;for(const s of e){const a=String(s);t[a]=(t[a]||0)+1,t[a]>r&&(r=t[a],n=s)}return n}function Sr(e){if(e.length===0)return 0;const t=Me(e),r=e.map(n=>Math.pow(n-t,2));return Math.sqrt(Me(r))}function ut(e,t){if(e.length===0)return 0;const r=[...e].sort((c,l)=>c-l),n=t/100*(r.length-1),s=Math.floor(n),a=Math.ceil(n),i=n%1;return s===a?r[s]:r[s]*(1-i)+r[a]*i}function Cr(e){if(e.length<4)return{indices:[],threshold:0};const t=ut(e,25),r=ut(e,75),n=r-t,s=t-1.5*n,a=r+1.5*n,i=[];return e.forEach((c,l)=>{(c<s||c>a)&&i.push(l)}),{indices:i,threshold:n}}function Or(e,t){if(e.length!==t.length||e.length===0)return 0;const r=e.length,n=Me(e),s=Me(t);let a=0,i=0,c=0;for(let l=0;l<r;l++){const o=e[l]-n,h=t[l]-s;a+=o*h,i+=o*o,c+=h*h}return i===0||c===0?0:a/Math.sqrt(i*c)}function Tr(e){if(e.length<2)return{direction:"stable",strength:0};const t=e.length,r=Array.from({length:t},(o,h)=>h),n=Me(r),s=Me(e);let a=0,i=0;for(let o=0;o<t;o++)a+=(r[o]-n)*(e[o]-s),i+=Math.pow(r[o]-n,2);const c=i===0?0:a/i,l=Math.min(Math.abs(c)/(Me(e)||1),1);return Math.abs(c)<.01?{direction:"stable",strength:0}:{direction:c>0?"up":"down",strength:l}}function it(e,t,r,n){var i;let s=50;const a=[];if(t){const c=t.toLowerCase();(c.includes("id")||c==="index")&&(s-=30,a.push("Identifier column (typically unique values)")),c.includes("name")&&n.uniqueCount/n.count>.8&&(s-=25,a.push("High cardinality name column")),(c.includes("email")||c.includes("phone")||c.includes("address"))&&(s-=30,a.push("Personal identifier (typically unique)")),(c.includes("time")||c.includes("date"))&&n.uniqueCount/n.count>.9&&(s-=20,a.push("High precision timestamp"))}switch(e){case"statistics":n.uniqueCount===1?(s-=40,a.push("All values are identical")):n.uniqueCount===n.count?(s-=35,a.push("All values are unique (no patterns)")):n.uniqueCount/n.count>.9?(s-=25,a.push("Very high cardinality (few patterns)")):n.uniqueCount/n.count<.1&&(s+=20,a.push("Low cardinality (clear patterns)")),n.stdDev!==void 0&&n.mean!==void 0&&n.stdDev/Math.abs(n.mean||1)>.5&&(s+=15,a.push("High variability in data"));break;case"correlation":const c=Math.abs(r.correlation||0);c>.8?(s+=30,a.push("Very strong correlation")):c>.6?(s+=20,a.push("Strong correlation")):c>.5&&(s+=10,a.push("Moderate correlation"));break;case"outlier":const o=(r.count||0)/(n.count||1);o>.05&&o<.2?(s+=25,a.push("Significant outliers detected")):o>0&&(s+=10,a.push("Some outliers present"));break;case"pattern":const h=(i=r.topPatterns)==null?void 0:i[0];if(h){const[,g]=h,y=g/n.count;y>.3&&y<.9&&(s+=20,a.push("Clear dominant pattern"))}break;case"trend":const p=r.strength||0;p>.5?(s+=30,a.push("Strong trend detected")):p>.3&&(s+=15,a.push("Moderate trend"));break}if(n.nullCount>0){const c=n.nullCount/n.count;c>.5?(s-=30,a.push("More than 50% missing data")):c>.2&&(s-=15,a.push("Significant missing data"))}return s=Math.max(0,Math.min(100,s)),{score:s,reasons:a}}async function kr(e,t,r,n){console.log(`Starting analysis for dataset ${e}`);for(const a of r){const i=t.map(p=>p[a.name]),c=Er(i,a.type),l=Ar(a.name,a.type,c),o=Ir(c,a.type),h=it("statistics",a.name,c,c);if(await n.prepare(`
      INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(e,"statistics",a.name,JSON.stringify(c),1,l,o,h.score).run(),a.type==="number"){const p=i.map(y=>Number(y)).filter(y=>!isNaN(y)),g=Cr(p);if(g.indices.length>0){const y=`Found ${g.indices.length} unusual values in "${a.name}" (${(g.indices.length/p.length*100).toFixed(1)}% of data). These values are significantly different from the rest and might need attention.`,x={count:g.indices.length,indices:g.indices.slice(0,10)},_=it("outlier",a.name,x,c);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"outlier",a.name,JSON.stringify(x),.85,y,g.indices.length>p.length*.05?"high":"medium",_.score).run()}if(p.length>5){const y=Tr(p);if(y.direction!=="stable"){const x=`"${a.name}" shows a ${y.direction==="up"?"rising":"falling"} trend with ${(y.strength*100).toFixed(0)}% strength. This ${y.direction==="up"?"increase":"decrease"} is consistent across the dataset.`,_=it("trend",a.name,y,c);await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"trend",a.name,JSON.stringify(y),y.strength,x,y.strength>.5?"high":"medium",_.score).run()}}}}const s=r.filter(a=>a.type==="number");for(let a=0;a<s.length;a++)for(let i=a+1;i<s.length;i++){const c=s[a],l=s[i],o=t.map(p=>Number(p[c.name])).filter(p=>!isNaN(p)),h=t.map(p=>Number(p[l.name])).filter(p=>!isNaN(p));if(o.length>5&&h.length>5){const p=Or(o,h);if(Math.abs(p)>.5){const g=jr(c.name,l.name,p),y={column1:c.name,column2:l.name,correlation:p},x=it("correlation",void 0,y,{count:o.length});await n.prepare(`
            INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(e,"correlation",`${c.name}_vs_${l.name}`,JSON.stringify(y),Math.abs(p),g,Math.abs(p)>.7?"high":"medium",x.score).run()}}}for(const a of r)if(a.type==="string"){const i=t.map(h=>h[a.name]).filter(h=>h),c={};i.forEach(h=>{c[h]=(c[h]||0)+1});const o=Object.entries(c).sort((h,p)=>p[1]-h[1]).slice(0,5);if(o.length>0&&o[0][1]>i.length*.1){const h=`The most common value in "${a.name}" is "${o[0][0]}" appearing ${o[0][1]} times (${(o[0][1]/i.length*100).toFixed(1)}% of records).`,p={topPatterns:o},g={count:i.length,uniqueCount:new Set(i).size},y=it("pattern",a.name,p,g);await n.prepare(`
          INSERT INTO analyses (dataset_id, analysis_type, column_name, result, confidence, explanation, importance, quality_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(e,"pattern",a.name,JSON.stringify(p),.9,h,"medium",y.score).run()}}console.log(`Analysis complete for dataset ${e}`)}function Ar(e,t,r){var n,s,a,i;return t==="number"?`"${e}" ranges from ${(n=r.min)==null?void 0:n.toFixed(2)} to ${(s=r.max)==null?void 0:s.toFixed(2)} with an average of ${(a=r.mean)==null?void 0:a.toFixed(2)}. About half the values are below ${(i=r.median)==null?void 0:i.toFixed(2)}.`:`"${e}" contains ${r.count} values with ${r.uniqueCount} unique entries. Most common: "${r.mode}".`}function jr(e,t,r){const n=Math.abs(r)>.7?"strong":"moderate";return r>0?`There's a ${n} relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to increase too (correlation: ${r.toFixed(2)}).`:`There's a ${n} inverse relationship between "${e}" and "${t}": when ${e} increases, ${t} tends to decrease (correlation: ${r.toFixed(2)}).`}function Ir(e,t){return e.nullCount>e.count*.5?"high":e.uniqueCount===1?"low":t==="number"&&e.stdDev>e.mean?"high":"medium"}async function $r(e,t,r,n){console.log(`Generating visualizations for dataset ${e}`);const s=await n.prepare(`
    SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
  `).bind(e).all(),a=new Map;s.results.forEach(l=>{a.set(l.id_column,l.name_column)});let i=0;const c=[...r].sort((l,o)=>(o.quality_score||50)-(l.quality_score||50));for(const l of c){if((l.quality_score||50)<30){console.log(`Skipping low-quality visualization for ${l.column_name} (score: ${l.quality_score})`);continue}const o=await Nr(l,t,a);o&&await n.prepare(`
        INSERT INTO visualizations (dataset_id, analysis_id, chart_type, title, config, explanation, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(e,l.id,o.chartType,o.title,JSON.stringify(o.config),o.explanation,i++).run()}console.log(`Generated ${i} visualizations`)}function Nr(e,t,r){switch(e.analysis_type){case"statistics":return Dr(e,t,r);case"correlation":return Mr(e,t,r);case"outlier":return Pr(e,t,r);case"pattern":return Fr(e,t,r);case"trend":return Lr(e,t,r);default:return null}}function Dr(e,t,r){const n=e.column_name;if(!n)return null;const s=e.result,a=r.has(n)?` (via ${r.get(n)})`:"";if(s.mean!==void 0){const o=t.map(p=>Number(p[n])).filter(p=>!isNaN(p)),h=qr(o);return{chartType:"bar",title:`Distribution: ${n}${a}`,explanation:`This histogram shows how values in "${n}" are distributed${a?" using human-readable names":""}. Taller bars mean more data points at that value range.`,config:{type:"bar",data:{labels:h.labels,datasets:[{label:"Frequency",data:h.data,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Distribution`}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Count"}},x:{title:{display:!0,text:n}}}}}}}const i=t.map(o=>o[n]).filter(o=>o!=null),c={};i.forEach(o=>{c[String(o)]=(c[String(o)]||0)+1});const l=Object.entries(c).sort((o,h)=>h[1]-o[1]).slice(0,10);return{chartType:"bar",title:`Top Values: ${n}${a}`,explanation:`This chart shows the most common values in "${n}"${a?" using human-readable names":""}. The tallest bar is the most frequent value.`,config:{type:"bar",data:{labels:l.map(([o])=>o),datasets:[{label:"Count",data:l.map(([,o])=>o),backgroundColor:"rgba(16, 185, 129, 0.6)",borderColor:"rgba(16, 185, 129, 1)",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,indexAxis:"y",plugins:{legend:{display:!1},title:{display:!0,text:`Most Common: ${n}`}},scales:{x:{beginAtZero:!0,title:{display:!0,text:"Count"}}}}}}}function Mr(e,t,r){const n=e.result,s=n.column1,a=n.column2;if(!s||!a)return null;const i=r.has(s)?` (via ${r.get(s)})`:"",c=r.has(a)?` (via ${r.get(a)})`:"",l=t.map(p=>({x:Number(p[s]),y:Number(p[a])})).filter(p=>!isNaN(p.x)&&!isNaN(p.y)),o=n.correlation,h=o>0?"rgba(139, 92, 246, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"scatter",title:`Relationship: ${s}${i} vs ${a}${c}`,explanation:`Each dot represents one record${i||c?" using human-readable names":""}. ${o>0?"The upward pattern shows they move together.":"The downward pattern shows they move in opposite directions."}`,config:{type:"scatter",data:{datasets:[{label:`${s} vs ${a}`,data:l,backgroundColor:h,borderColor:h.replace("0.6","1"),borderWidth:1,pointRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`Correlation: ${o.toFixed(2)}`}},scales:{x:{title:{display:!0,text:s}},y:{title:{display:!0,text:a}}}}}}}function Pr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=new Set(e.result.indices||[]),i=t.map((o,h)=>({x:h,y:Number(o[n]),isOutlier:a.has(h)})).filter(o=>!isNaN(o.y)),c=i.filter(o=>!o.isOutlier),l=i.filter(o=>o.isOutlier);return{chartType:"scatter",title:`Outliers: ${n}${s}`,explanation:`Red dots are unusual values that stand out from the pattern${s?" (using human-readable names)":""}. Blue dots are normal values.`,config:{type:"scatter",data:{datasets:[{label:"Normal",data:c,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,pointRadius:3},{label:"Outliers",data:l,backgroundColor:"rgba(239, 68, 68, 0.8)",borderColor:"rgba(239, 68, 68, 1)",borderWidth:2,pointRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top"},title:{display:!0,text:`${n} - Outlier Detection`}},scales:{x:{title:{display:!0,text:"Record Index"}},y:{title:{display:!0,text:n}}}}}}}function Fr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=e.result.topPatterns||[];if(a.length===0)return null;const i=a.slice(0,8);return{chartType:"pie",title:`Pattern Distribution: ${n}${s}`,explanation:`Each slice shows what percentage of records have that value${s?" using human-readable names":""}. Bigger slices are more common.`,config:{type:"pie",data:{labels:i.map(([c])=>c),datasets:[{data:i.map(([,c])=>c),backgroundColor:["rgba(59, 130, 246, 0.8)","rgba(16, 185, 129, 0.8)","rgba(245, 158, 11, 0.8)","rgba(239, 68, 68, 0.8)","rgba(139, 92, 246, 0.8)","rgba(236, 72, 153, 0.8)","rgba(14, 165, 233, 0.8)","rgba(34, 197, 94, 0.8)"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"right"},title:{display:!0,text:`${n} Breakdown`}}}}}}function Lr(e,t,r){const n=e.column_name;if(!n)return null;const s=r.has(n)?` (via ${r.get(n)})`:"",a=t.map(l=>Number(l[n])).filter(l=>!isNaN(l)),i=e.result,c=i.direction==="up"?"rgba(16, 185, 129, 0.6)":"rgba(239, 68, 68, 0.6)";return{chartType:"line",title:`Trend: ${n}${s}`,explanation:`This line shows how "${n}" changes over time${s?" using human-readable names":""}. ${i.direction==="up"?"The upward slope indicates growth.":"The downward slope indicates decline."}`,config:{type:"line",data:{labels:a.map((l,o)=>`#${o+1}`),datasets:[{label:n,data:a,backgroundColor:c,borderColor:c.replace("0.6","1"),borderWidth:2,fill:!1,tension:.3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},title:{display:!0,text:`${n} Over Time (${i.direction==="up"?"↗":"↘"} ${Math.round(i.strength*100)}% strength)`}},scales:{x:{title:{display:!0,text:"Record Number"}},y:{title:{display:!0,text:n}}}}}}}function qr(e,t=10){if(e.length===0)return{labels:[],data:[]};const r=Math.min(...e),a=(Math.max(...e)-r)/t,i=new Array(t).fill(0),c=[];for(let l=0;l<t;l++){const o=r+l*a,h=r+(l+1)*a;c.push(`${o.toFixed(1)}-${h.toFixed(1)}`)}return e.forEach(l=>{let o=Math.floor((l-r)/a);o>=t&&(o=t-1),o<0&&(o=0),i[o]++}),{labels:c,data:i}}const vn=new Pe;vn.post("/:id",async e=>{try{const t=Number(e.req.param("id")),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);let s=(await e.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(t).all()).results.map(o=>JSON.parse(o.data));const a=JSON.parse(r.columns),i=await e.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(t).all();if(i.results.length>0){const o=i.results.map(h=>({id_column:h.id_column,name_column:h.name_column,confidence:1}));console.log(`Applying ${o.length} column mappings for human-readable analysis...`),s=_r(s,o);for(const h of o){const p=a.find(g=>g.name===h.id_column);p&&(p.enriched_by=h.name_column)}}await kr(t,s,a,e.env.DB);const l=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(o=>({...o,result:JSON.parse(o.result)}));return await $r(t,s,l,e.env.DB),await e.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind("complete","complete",t).run(),e.json({success:!0,message:"Analysis complete",analyses_count:l.length,dataset_id:t})}catch(t){return console.error("Analysis error:",t),e.json({error:"Analysis failed: "+t.message},500)}});const xn=new Pe;xn.get("/:id",async e=>{try{const t=e.req.param("id"),r=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Dataset not found"},404);const n=JSON.parse(r.columns),a=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(t).all()).results.map(g=>({...g,result:JSON.parse(g.result)})),i=[],c=[],l=new Map;for(const g of n){const y=`col_${g.name}`;if(!l.has(y)){const _=10+g.unique_count/r.row_count*30;i.push({id:y,label:g.name,type:"column",size:_}),l.set(y,!0)}}const o=a.filter(g=>g.analysis_type==="correlation"),h=o.sort((g,y)=>Math.abs(y.result.correlation)-Math.abs(g.result.correlation)).slice(0,Math.min(50,o.length));for(const g of h){const{column1:y,column2:x,correlation:_}=g.result,D=`col_${y}`,L=`col_${x}`;n.length>50&&Math.abs(_)<.7||c.push({source:D,target:L,type:"correlation",strength:Math.abs(_),label:`${_>0?"+":""}${_.toFixed(2)}`})}const p=a.filter(g=>g.analysis_type==="pattern"&&(g.quality_score||0)>50);for(const g of p){const y=g.column_name;if(!y)continue;const{topPatterns:x}=g.result;if(!x||x.length===0)continue;const _=x.slice(0,3);for(const[D,L]of _){const Z=`val_${y}_${D}`;l.has(Z)||(i.push({id:Z,label:String(D),type:"value",size:5+L/r.row_count*20}),l.set(Z,!0)),c.push({source:`col_${y}`,target:Z,type:"contains",strength:L/r.row_count,label:`${L}x`})}}return e.json({nodes:i,edges:c,dataset_name:r.name})}catch(t){return console.error("Relationship graph error:",t),e.json({error:"Failed to generate relationship graph"},500)}});const St=new Pe;St.get("/:datasetId",async e=>{try{const t=e.req.param("datasetId"),r=await e.env.DB.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(t).all();return e.json({mappings:r.results})}catch(t){return console.error("Mappings fetch error:",t),e.json({error:"Failed to fetch mappings"},500)}});St.delete("/:id",async e=>{try{const t=e.req.param("id");return await e.env.DB.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mapping delete error:",t),e.json({error:"Failed to delete mapping"},500)}});St.post("/",async e=>{try{const{dataset_id:t,id_column:r,name_column:n}=await e.req.json();return await e.env.DB.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(t,r,n).run(),e.json({success:!0})}catch(t){return console.error("Mapping create error:",t),e.json({error:"Failed to create mapping"},500)}});const wn=new Pe;wn.post("/:datasetId",async e=>{var t,r,n,s;try{const a=e.req.param("datasetId"),{message:i,conversationHistory:c=[]}=await e.req.json(),l=e.env.OPENAI_API_KEY;if(!l||l.includes("your-openai-api-key"))return e.json({error:"OpenAI API key not configured",message:ot(i)},500);const o=await e.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(a).first();if(!o)return e.json({error:"Dataset not found"},404);const p=(await e.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC LIMIT 20
    `).bind(a).all()).results.map(z=>({type:z.analysis_type,column:z.column_name,importance:z.importance,confidence:z.confidence,quality_score:z.quality_score,explanation:z.explanation,result:JSON.parse(z.result)})),g=JSON.parse(o.columns),y=Hr(o,g,p),_=[{role:"system",content:`You are a data analysis assistant helping users understand their dataset.

Dataset: ${o.name}
Rows: ${o.row_count}
Columns: ${o.column_count}

${y}

Your role:
- Explain findings in plain, conversational English
- Answer questions about patterns, correlations, outliers
- Provide specific numbers and examples from the data
- Suggest what to investigate next
- Be concise but thorough (max 3-4 paragraphs)
- Use bullet points for lists

If asked about specific insights not in the context, politely explain what data you have access to.`},...c,{role:"user",content:i}],D=e.env.OPENAI_MODEL||"gpt-4o-mini";console.log(`Calling OpenAI API with model: ${D}`);const L=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l}`},body:JSON.stringify({model:D,messages:_,max_tokens:1e3,temperature:.7})}),Z=await L.text();if(!L.ok){console.error("OpenAI API error status:",L.status),console.error("OpenAI API error response:",Z);let z="Failed to get response from OpenAI";try{z=((t=JSON.parse(Z).error)==null?void 0:t.message)||z}catch{}return e.json({error:z,message:ot(i)},500)}let ce;try{ce=JSON.parse(Z)}catch{return console.error("Failed to parse OpenAI response:",Z),e.json({error:"Invalid response from OpenAI",message:ot(i)},500)}const re=(s=(n=(r=ce.choices)==null?void 0:r[0])==null?void 0:n.message)==null?void 0:s.content;if(!re)return console.error("No message in OpenAI response:",ce),e.json({error:"Empty response from OpenAI",message:ot(i)},500);const _e=zr(i,p);return e.json({message:re,suggestions:_e})}catch(a){console.error("Chat error:",a);const i=a instanceof Error?a.message:String(a);return e.json({error:"Chat failed: "+i,message:ot("error")},500)}});function Hr(e,t,r){let n=`
Columns (showing first 30):
`;return t.slice(0,30).forEach(s=>{n+=`- ${s.name} (${s.type}, ${s.unique_count} unique values)
`}),t.length>30&&(n+=`... and ${t.length-30} more columns
`),n+=`
Top ${Math.min(20,r.length)} Insights (sorted by quality):
`,r.forEach((s,a)=>{var i;n+=`
${a+1}. ${s.type.toUpperCase()}`,s.column&&(n+=` on "${s.column}"`),n+=`:
`,n+=`   ${s.explanation}
`,n+=`   Importance: ${s.importance}, Confidence: ${Math.round(s.confidence*100)}%, Quality: ${((i=s.quality_score)==null?void 0:i.toFixed(0))||"N/A"}
`,s.type==="correlation"&&s.result.correlation&&(n+=`   Correlation coefficient: ${s.result.correlation.toFixed(3)}
`),s.type==="outlier"&&s.result.count&&(n+=`   Outliers found: ${s.result.count} rows
`)}),n}function zr(e,t){const r=e.toLowerCase(),n=[];r.includes("correlat")||r.includes("relation")?(n.push("Are there any unusual outliers?"),n.push("What patterns exist in categorical data?")):r.includes("outlier")||r.includes("unusual")?(n.push("What are the strongest correlations?"),n.push("Show me trends over time")):r.includes("pattern")?(n.push("Are there any trends in the data?"),n.push("Which columns are most correlated?")):(n.push("What's the most important finding?"),n.push("Which columns have outliers?"),n.push("Show me strong correlations"));const s=t.filter(a=>(a.quality_score||0)>70);return s.length>0&&n.length<4&&n.push(`Tell me more about ${s[0].column||"the top finding"}`),n.slice(0,3)}function ot(e){const t=e.toLowerCase();return t.includes("correlat")||t.includes("relation")?"I found several correlations in your data. Check the 'Insights' tab and search for 'correlation' to see the strongest relationships between columns.":t.includes("outlier")||t.includes("unusual")?"To see outliers, go to the 'Insights' tab and search for 'outlier'. I've highlighted unusual values in several columns.":t.includes("pattern")?"Patterns have been detected in your categorical columns. Search for 'pattern' in the Insights tab to see frequency distributions.":"I'm currently operating in fallback mode. To enable full AI chat, please configure your OpenAI API key in the .dev.vars file (for local) or as an environment variable (for production)."}const be=new Pe;be.use("/api/*",nr());be.use("/static/*",hr({root:"./public"}));be.route("/api/upload",bn);be.route("/api/datasets",nt);be.route("/api/analyze",vn);be.route("/api/relationships",xn);be.route("/api/mappings",St);be.route("/api/chat",wn);be.get("/api/health",e=>e.json({status:"ok",timestamp:new Date().toISOString()}));be.get("/",e=>e.html(`
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
  `));const Bt=new Pe,Br=Object.assign({"/src/index.tsx":be});let _n=!1;for(const[,e]of Object.entries(Br))e&&(Bt.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),Bt.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),_n=!0);if(!_n)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Bt as default};
