;(function(obj, undefined){

	var meditId = null;

	var container = [];
	
	var regNodeId = /medit\-(\d+)\-(\d+)$/;
	
	var regContent = /\s*(class|id|contenteditable)(=".*?")?/g; // 获得内容时去除id，class和可编辑状态
	
	var regIsNotContentEmpty = /^<.*?>$/; // 获得内容时检测是否是纯文本
	
	var regNormalStyle = /(font\-style\s*:\s*normal\s*;)|(font\-weight\s*:\s*normal\s*;)|(\s*)/ig; // 正常的样式需要剔除
	
	var selectTextReg = /<span class="medit\-text\-select">(.*?)<\/span>/i;
	
	var isToolMove = false;
	
	var toolBarCatch = null;
	
	var isContainMove = false;
	
	var mainTouchPoint = {};
	
	var nowNode = null; // 当前选择的可编辑结点

	var returnButtonHtml = function(from){
		return '<span id="medit-tool-button-'+from+'" class="medit-tool-button  medit-tool-return" data-meditToolStyle="return" data-meditToolDegree="1">&nbsp;</span>';
	}
	
	var toArray = function(obj){
		return [].slice.call(obj);
	}
	
	var mainButton = ["addLeft","delete","setting","mode","ok","addRight"];
	
	var nowMode = "text";
	
	var mode = {
		"text": {
			icon: '../src/images/mode/text.png',
			doWhat: function(node){
				mode[node.getAttribute("data-meditmode")].blur(node);
				node.style.display = null;
				node.style.backgroundColor = null;
				node.setAttribute("data-meditmode", "text");
				mode["text"].focus(node);
				nodeFocus(node);
				toolBarModeSetting("text",mode["text"].setting);
				nowMode = "text";
			},
			isMerge: true,
			focus:function(node) {
				node.setAttribute("contentEditable","true");
				node.setAttribute("class","medit-editing");
			},
			blur:function(node) {
				node.innerHTML = node.innerHTML.replace(selectTextReg,"$1");
				node.setAttribute("contentEditable","false");
				node.setAttribute("class","");
			},
			empty:function(node) {
				return node.innerHTML == "";
			},
			setting:[
				{
					name:"bold",
					icon:"../src/images/text/bold.png",
					doWhat:function(node){
						var style = node.getAttribute("style");
						var reg = /font\-weight\s*:\s*(.*?)\s*;/i;
						if(reg.test(style)){
							var regRes = reg.exec(style);
							if(regRes[1] == "bold"){
								node.style.fontWeight = "normal";
								return;
							}
						}
						node.style.fontWeight = "bold";
					}
				},
				{
					name:"italic",
					icon:"../src/images/text/italic.png",
					doWhat:function(node){
						var style = node.getAttribute("style");
						var reg = /font\-style\s*:\s*(.*?)\s*;/i;
						if(reg.test(style)){
							var regRes = reg.exec(style);
							if(regRes[1] == "italic"){
								node.style.fontStyle = "normal";
								return;
							}
						}
						node.style.fontStyle = "italic";
					}
				},
				{
					name:"underline",
					icon:"../src/images/text/underline.png",
					doWhat:function(node){
						var style = node.getAttribute("style");
						var reg = /text\-decoration\s*:\s*(.*?)\s*;/i;
						if(reg.test(style)){
							var regRes = reg.exec(style);
							if(regRes[1] == "underline"){
								node.style.textDecoration = "none";
								return;
							}
						}
						node.style.textDecoration = "underline";
					}
				}
				,
				{
					name:"size",
					icon:"../src/images/text/size.png",
					doWhat:[
						{
							name: "fontSizeBig",
							icon:"../src/images/text/sizeBigger.png",
							doWhat: function(node) {
								var style = node.getAttribute("style");
								var displaySize = document.getElementById("medit-tool-button-text-setting-3-doWhat-1");
								var reg = /font\-size\s*:\s*(\d*)\s*(?:.*?)\s*;/i;
								var size = 15;
								if(reg.test(style)){
									var regRes = reg.exec(style);
									size = ++regRes[1];
								}
								
								if(displaySize){
									displaySize.innerHTML = size;
								}
								node.style.fontSize = size + "px";
							}
						},
						{
							name: "fontSizeValue",
							icon: "",
							defaultValue: "size"
						},
						{
							name: "fontSizeSmall",
							icon:"../src/images/text/sizeSmaller.png",
							doWhat: function(node) {
								var style = node.getAttribute("style");
								var displaySize = document.getElementById("medit-tool-button-text-setting-3-doWhat-1");
								var reg = /font\-size\s*:\s*(\d*)\s*(?:.*?)\s*;/i;
								var size = 13;
								if(reg.test(style)){
									var regRes = reg.exec(style);
									size = --regRes[1];
									if(size<12)size=12;
								}
								
								if(displaySize){
									displaySize.innerHTML = size;
								}
								node.style.fontSize = size + "px";
							}
						}
					]
				},
				{
					name: "color",
					icon:"../src/images/text/color.png",
					doWhat:[
						{
							name: "black",
							icon:"../src/images/text/colorBlack.png",
							doWhat:function(node){
								node.style.color = "#000000";
							}
						},
						{
							name: "red",
							icon:"../src/images/text/colorRed.png",
							doWhat:function(node){
								node.style.color = "#ff0000";
							}
						},
						{
							name: "green",
							icon:"../src/images/text/colorGreen.png",
							doWhat:function(node){
								node.style.color = "#00ff00";
							}
						},
						{
							name: "blue",
							icon:"../src/images/text/colorBlue.png",
							doWhat:function(node){
								node.style.color = "#0000ff";
							}
						},
						{
							name: "yellow",
							icon:"../src/images/text/colorYellow.png",
							doWhat:function(node){
								node.style.color = "#ffff00";
							}
						},
						{
							name: "pink",
							icon:"../src/images/text/colorPink.png",
							doWhat:function(node){
								node.style.color = "#ff00ff";
							}
						}
					]
				}
			],
			selecting : function(node, isAdd){
				var selectReg = selectTextReg;
				if(selectReg.test(node.innerHTML)){
					var regRes = node.innerHTML.split(selectReg);
					if(isAdd){
						if(regRes[1].length>1){
							if(/^&nbsp;|^<(.*?)\s(.*?)>(.*?)<\/(.*?)>/.test(regRes[1])){
								var innerTagReg = /^&nbsp;|^<(.*?)\s(.*?)>(.*?)<\/(.*?)>/.exec(regRes[1]);
								var replaceHTML = innerTagReg[0];
								regRes[0] += replaceHTML;
								regRes[1] = regRes[1].replace(/^&nbsp;|^<(.*?)\s(.*?)>(.*?)<\/(.*?)>/, "");
							}else{
								regRes[0] = regRes[0] + regRes[1].slice(0, 1);
								regRes[1] = regRes[1].slice(1);
							}
						}
					}else{
						if(regRes[1].length>1){
							if(/<(.*?)\s(.*?)>(.*?)<\/(.*?)>$|&nbsp;$/.test(regRes[1])){
								var innerTagReg = /<(.*?)\s(.*?)>(.*?)<\/(.*?)>$|&nbsp;$/.exec(regRes[1]);
								var replaceHTML = innerTagReg[0];
								regRes[2] = replaceHTML + regRes[2];
								regRes[1] = regRes[1].replace(/<(.*?)\s(.*?)>(.*?)<\/(.*?)>$|&nbsp;$/, "");
							}else{
								regRes[2] = regRes[1].slice(-1) + regRes[2];
								regRes[1] = regRes[1].slice(0, -1);
							}
						}
					}
					
					node.innerHTML = regRes[0] + '<span class="medit-text-select">' + regRes[1] + '</span>' + regRes[2];
				}else{
					node.innerHTML = '<span class="medit-text-select">' + node.innerHTML + '</span>';
				}
			},
			selected: function(thisNode){
				var selectReg = selectTextReg;
				var newNode;
				var contain = container[meditId];
				if(selectReg.test(thisNode.innerHTML)) {
					var thisId = regNodeId.exec(thisNode.getAttribute("id"))[1];
					var regRes = thisNode.innerHTML.split(selectReg);
					var style = thisNode.getAttribute("style");
					if(regRes[0]!==''){
						var spanPre =document.createElement("span");
						spanPre.setAttribute("data-medit","true");
						spanPre.setAttribute("data-meditMode","text");
						spanPre.setAttribute("id","medit-" + thisId + "-" + meditId );
						spanPre.setAttribute("style",style);
						spanPre.innerHTML = regRes[0];
						thisNode.parentNode.insertBefore(spanPre, thisNode);
						thisId++;
					}
					if(regRes[2]!==''){
						thisNode.innerHTML = regRes[2];
						var span =document.createElement("span");
						span.setAttribute("data-medit","true");
						span.setAttribute("data-meditMode","text");
						span.setAttribute("id","medit-" + thisId + "-" + meditId );
						span.setAttribute("contentEditable","true");
						span.setAttribute("class","medit-editing");
						span.setAttribute("style",style);
						span.innerHTML = regRes[1];
						this.blur(thisNode);
						thisNode.parentNode.insertBefore(span, thisNode);
						newNode = thisNode.previousSibling;
					}else{
						thisNode.innerHTML = regRes[1];
						
						newNode = thisNode;
					}
					
					contain.nowNodeId = thisId;
					if(thisId>=2){
						thisId -=2;
					}
					contain.updateId(thisId); // 未来需要合并相同style的span
					nodeFocus(newNode);
				}else{
					newNode = thisNode;
				}
				return newNode;
			}
		},
		"br":{
			icon: '../src/images/mode/br.png',
			doWhat: function(node) { // 需要继续
				mode[node.getAttribute("data-meditmode")].blur(node);
				node.style.display = "block";
				node.innerHTML = " ";
				node.setAttribute("data-meditmode", "br");
				mode["br"].focus(node);
				nodeFocus(node);
				toolBarModeSetting("br",[]);
				container[meditId].updateId();
				nowMode = "br";
			},
			focus:function(node) {
				node.style.backgroundColor = "#e5e5e5";
			},
			blur:function(node) {
				node.style.backgroundColor = "";
			}
		},
		"link":{
			icon: '../src/images/mode/link.png',
			doWhat: function(node) {
				mode[node.getAttribute("data-meditmode")].blur(node);
				node.style.display = null;
				node.setAttribute("data-meditmode", "link");
				mode["link"].focus(node);
				nodeFocus(node);
				toolBarModeSetting("link",[]);
				nowMode = "link";
			},
			focus: function(node){
				node.setAttribute("contentEditable","true");
				node.setAttribute("class","medit-link");
			},
			blur:function(node){
				node.setAttribute("contentEditable","false");
				node.setAttribute("class",null);
			}
		}
	}
	
	var isType = function(ele, type){
		if(!ele || !type)return false;
		return {}.toString.call(ele).slice(8, -1).toLowerCase() === type.toLowerCase();
	}
	
	var mergeStyleIsSimilar = function(styleA, styleB){
		if(styleA){
			styleA = styleA.replace(regNormalStyle, "");
		}
		if(styleB){
			styleB = styleB.replace(regNormalStyle, "");
		}
		if(!styleA && !styleB) return true;
		if(styleA && !styleB || !styleA && styleB) return false;
		
		var styleArrA = styleA.split(";").sort();
		var styleArrB = styleB.split(";").sort();

		if(styleArrA.length != styleArrB.length) return false;
		
		for(var i=0;i<styleArrA.length;i++){
			if(styleArrA[i]!==styleArrB[i])return false;
		}
		return true;
	}
	
	var mergeSimilarNextNode = function(node){
		var nowMode = node.getAttribute("data-meditMode");
		var nowStyle = node.getAttribute("style");
		var nextNode = node.nextSibling;
		if(!nextNode){
			nodeFocus(node);
			return node;
		}
		var nextMode = nextNode.getAttribute("data-meditMode");
		if(nowMode==nextMode && nextNode && mode[nowMode].isMerge){
			var nodeMode = nextNode.getAttribute("data-meditMode");
			var nextStyle = nextNode.getAttribute("style");
			if(mergeStyleIsSimilar(nowStyle, nextStyle) && !!node.innerHTML && !!nextNode.innerHTML){
				var nowId = regNodeId.exec(node.getAttribute("id"))[1];
				node.innerHTML = node.innerHTML + nextNode.innerHTML;
				node.parentNode.removeChild(nextNode);
				container[meditId].updateId(nowId);
				nodeFocus(node);
				if(node.nextSibling){
					return mergeSimilarNextNode(node);
				}
			}
		}
		return node;
	}
	 
	var mergeSimilarPreNode = function(node){ // 160918
		var nowMode = node.getAttribute("data-meditMode");
		var nowStyle = node.getAttribute("style");
		var previousNode = node.previousSibling;
		if(!previousNode){
			nodeFocus(node);
			return node;
		}
		var previousMode = previousNode.getAttribute("data-meditMode");
		if(previousMode==nowMode && previousNode && mode[nowMode].isMerge){
			var nodeMode = previousNode.getAttribute("data-meditMode");
			var previousStyle = previousNode.getAttribute("style");
			if(mergeStyleIsSimilar(nowStyle, previousStyle)){
				var nowId = regNodeId.exec(previousNode.getAttribute("id"))[1];
				previousNode.innerHTML = previousNode.innerHTML + node.innerHTML;
				previousNode.parentNode.removeChild(node);
				
				container[meditId].updateId(nowId);
				nodeFocus(previousNode);
				node = previousNode;
				if(node.previousSibling){
					return mergeSimilarPreNode(node);
				}
			}
		}
		return node;
	}
	
	var gevent = function (ele,event,func){
		if(isType(event, "array")){
			event.forEach(function(v){
				gevent(ele, v, func);
			});
		}else{
			if(window.addEventListener){
				ele.addEventListener(event,func,false);
			}else if(window.attachEvent){
				ele.attachEvent("on"+event,func);
			}else{
				ele["on"+event]=func;
			}
		}
	}
	
	var initFromData = function(target){ // 如果原来容器内有数据的话，那么根据原来数据进行初始化
	
		var contain = target.parentNode;
		
		meditId = contain.getAttribute("data-meditid");
		
		contain = container[meditId];
		contain.nodeCount = contain.node.children.length;
		for(var i = 0;i<contain.nodeCount;i++ ){
			if(target === contain.node.children[i]){
				contain.nowNodeId = i;
			}
			contain.node.children[i].setAttribute("id","medit-" + i + "-" + meditId );
		}
	}
	
	var toolBar = (function(){
		
		var temTool = document.createElement("div");
		temTool.setAttribute("id","medit-tool");
		document.body.appendChild(temTool);
		
		var tool = document.getElementById("medit-tool");
		
	
		gevent(tool, ["touchmove"], function(e){
			isToolMove = true;
		});
		gevent(tool, ["touchend"], function(e){
			if(isToolMove){
				isToolMove=false;
				return;
			} 
			e = e || window.event;
			var target = e.target || e.srcElement;
			
			var type = target.getAttribute("data-meditToolStyle");
			if(!type) return false;
			
			var degree = target.getAttribute("data-meditToolDegree");
			
			mainDo(degree, type, target);
			
		});
		
		return tool;
		
	})();
	
	var mainDo = function(degree, type, target) {
			
			var contain = container[meditId];
			var thisNode = document.getElementById("medit-" + contain.nowNodeId + "-" + meditId);
			
			nowMode = thisNode.getAttribute("data-meditMode");
			if(degree == 1) {
				switch(type){
					case 'delete':
						if(mode[nowMode].blur){
							mode[nowMode].blur(thisNode);
						}
						
						thisNode.parentNode.removeChild(thisNode);
						contain.updateId(contain.nowNodeId);
						toolBarHidden();
						break;
					case 'ok':
						if(mode[nowMode].blur){
							mode[nowMode].blur(thisNode);
						}

						if(thisNode.innerHTML=="") thisNode.parentNode.removeChild(thisNode);;
						toolBarHidden();
						contain.nodeCount++;
						
						thisNode = mergeSimilarNextNode(thisNode);
						mergeSimilarPreNode(thisNode);
						break;
					case 'addLeft':
						if(thisNode.innerHTML==""){
							return;
						}
						if(mode[nowMode].blur){
							mode[nowMode].blur(thisNode);
						}
						contain.createSpan(contain.nowNodeId, thisNode, false, true);
						break;
					case 'addRight':
						if(thisNode.innerHTML==""){
							return;
						}
						if(mode[nowMode].blur){
							mode[nowMode].blur(thisNode);
						}
						contain.createSpan(contain.nowNodeId, thisNode, true, true);
						
						break;
					case 'mode':
						var toolBarRes = [];
						toolBarRes.push(returnButtonHtml(nowMode + "-setting-1"));
						for(var modeType in mode){
							if(mode.hasOwnProperty(modeType) && modeType != nowMode){
								var style = mode[modeType].icon?' style="background:#fff url('+ mode[modeType].icon+') no-repeat center center;background-size: 24px;"':'';
							
								toolBarRes.push('<span id="medit-tool-button-'+modeType+'" class="medit-tool-button" data-meditToolStyle="'+modeType+'"'+style+' data-meditToolDegree="2">&nbsp;</span>');
							}
						}
						toolBar.innerHTML = toolBarRes.join("");
						break;
						
					case 'return':
						var path = target.getAttribute("id").replace("medit-tool-button-","");
						var nodePath = path.split("-");
						var doWhat = mode;
						var pathMode = null;
						
						if(nodePath.length === 3){
							path = nodePath[0];
							nodePath.pop();
						}
						
						while(pathMode = nodePath.shift()){
							doWhat = doWhat[pathMode];
						}
						
						toolBarModeSetting(path, doWhat);

						break;
				}
			}else{
				
				if( mode[nowMode].selected ){
					thisNode = mode[nowMode].selected(thisNode);
				}
			
				var pathRes =  target.getAttribute("id").replace("medit-tool-button-","");
				
				var pathArr = pathRes.split("-");
				
				var pathMode = null;
				
				var doWhat = mode;
				
				while(pathMode = pathArr.shift()){
					doWhat = doWhat[pathMode];
				}
				
				doWhat = doWhat.doWhat;
				
				if(isType(doWhat, "array")){
					toolBarModeSetting(pathRes, doWhat);
				}else{
					doWhat(thisNode);
				}
			}
			
			if(!contain.node.children.length) contain.node.innerHTML = contain.preHTML || "Medit";
	}
	
	var toolBarModeSetting = function(path, list){
	
		var pathRes = path.split("-");
		
		var toolBarRes = [];
		
		if(pathRes.length === 1){
			
			mainButton.forEach(function(v,index){

				if(v === "setting"){
					if(list){
						list.forEach(function(listv, listIndex){
							
							var defaultValue = listv.defaultValue || "&nbsp;";
							
							var style = listv.icon?' style="background:#fff url('+listv.icon+') no-repeat center center;background-size: 24px;"':'';
							
							toolBarRes.push('<span id="medit-tool-button-'+path+'-setting-'+listIndex+'" class="medit-tool-button" data-meditToolStyle="'+path+"-setting-"+listIndex+'"'+style+' data-meditToolDegree="2">'+defaultValue+'</span>');
						});
					}
				}else{
					toolBarRes.push('<span id="medit-tool-button-'+v+'" class="medit-tool-button medit-tool-'+v+'" data-meditToolStyle="'+v+'" data-meditToolDegree="1">&nbsp;</span>');
				}
			});
			
		}else{
			toolBarRes.push(returnButtonHtml(path));
			if(!!list.length){
				list.forEach(function(listv, listIndex){
							
					var defaultValue = listv.defaultValue || "&nbsp;";
							
					var style = listv.icon?' style="background:#fff url('+listv.icon+') no-repeat center center;background-size: 24px;"':' style="background:#fff;"';
							
					toolBarRes.push('<span id="medit-tool-button-'+path+'-doWhat-'+listIndex+'" class="medit-tool-button" data-meditToolStyle="'+path+"-doWhat-"+listIndex+'"'+style+' data-meditToolDegree="2">'+defaultValue+'</span>');
				});
			}
		}
		
		toolBar.innerHTML = toolBarRes.join("");
		
	}
	
	var toolBarDisplay = function() {
		if(toolBarCatch)
			toolBar.innerHTML = toolBarCatch;
		toolBar.style.display = "block";
	}
	
	var toolBarHidden = function() {
		nowNode = null;
		toolBar.style.display = "none";
	}
	
	var toBr = function(node){
		node.setAttribute("style","display:block");
		node.setAttribute("data-meditMode","br");
		node.setAttribute("contentEditable","false");
		node.setAttribute("class","");
		node.innerHTML = " ";
	}
	
	var nodeFocus = function(node){ // 使模块自动获取焦点 使用了很多方法，最后发现这个方法是在移动端最好的
		setTimeout(function() {
			node.focus();
			container[meditId].nowNodeId = regNodeId.exec(node.getAttribute("id"))[1];
		}, 10);
	}
	
	var selectModeContent = function(isAdd){
		if(nowNode){
			var nodeMode = nowNode.getAttribute("data-meditmode");
			var nodeModeObj = mode[nodeMode];
			if(nodeModeObj.selecting){
				nodeModeObj.selecting(nowNode, isAdd);
			}
			
		}
	}
		
	var medit = function(node) {
		if(!(this instanceof medit)) return new medit(node);
		
		if(!node || node.nodeType != 1)return false;
		
		this.node = node;
		this.nodeCount = 0; // 容器所有子元素数目
		this.nowNodeId = 0;	// 容器当前子元素ID
		
		this.getContent = medit.prototype.getContent;
		
		this.node.setAttribute("data-meditId",container.length);
		
		container.push(this);
		
		
		gevent(this.node, ["touchstart"], function(e){
			mainTouchPoint = e.targetTouches[0];
		});
		
		gevent(this.node, ["touchmove"], function(e){
		
			e = e || window.event;
			var distance = e.targetTouches[0].clientX - mainTouchPoint.clientX;
			
			if(Math.abs(distance) > 50){
				var isAdd = distance > 0? true: false; 
				selectModeContent(isAdd);
				mainTouchPoint = e.targetTouches[0];
			}
			isContainMove = true;
		});
		gevent(this.node, ["touchend"], this.editContainFocus);
		
		gevent(this.node, ["keydown"], function(e){
			e = e || window.event;
			if(e.keyCode == 13){
				e.preventDefault();
				var contain = container[meditId];
				var thisNode = document.getElementById("medit-" + contain.nowNodeId + "-" + meditId);
				nowMode = thisNode.getAttribute("data-meditMode");
				if(mode[nowMode].blur){
					mode[nowMode].blur(thisNode);
				}
				contain.createSpan(contain.nowNodeId, thisNode, true, true);
						
				var brNode = document.getElementById("medit-" + contain.nowNodeId + "-" + meditId);
				toBr(brNode);
						
				contain.createSpan(contain.nowNodeId, brNode, true, true);
			}
		});
	}
	
	var returnNextNodeId = function(node){
		var child = node.children;
		if(child.length) return returnNextNodeId(child[child.length-1]);
		return Number(regNodeId.exec(node.getAttribute("id"))[1])+1;
	}
	
	medit.prototype.createSpan = function(nodeId, fromNode, isAfter, isAutoFocus){ // 因为在内部创建span的时候不会自动focus，需要调用一下focus方法
		var span =document.createElement("span");
		span.setAttribute("data-medit","true");
		span.setAttribute("data-meditMode","text");
		span.setAttribute("id","medit-" + nodeId + "-" + meditId );
		span.setAttribute("contentEditable","true");
		span.setAttribute("class","medit-editing");
		if(fromNode){
			if(!isAfter){
				this.nowNodeId = nodeId;
				fromNode.parentNode.insertBefore(span, fromNode);
			}else{
				this.nowNodeId = returnNextNodeId(fromNode);
				if(!fromNode.nextSibling){
					fromNode.parentNode.appendChild(span);
				}else{
					fromNode.parentNode.insertBefore(span, fromNode.nextSibling); 
				}
			}
			this.updateId(nodeId);
		}else{
			this.node.appendChild(span);
		}
		var editor = document.getElementById("medit-" + this.nowNodeId + "-" + meditId);
		nowNode = editor;
		toolBarModeSetting("text", mode["text"].setting);
	
		if(isAutoFocus){
			nodeFocus(editor);
		}
		
	}
	
	medit.prototype.updateId = function(nodeId) {
			
		
		var child = toArray(this.node.children);
		var index = 0;
		child.forEach(function(v){
			v.setAttribute("id","medit-" + (index++) + "-" + meditId );
			var secondChild = toArray(v.children);
			if(secondChild.length){
				secondChild.forEach(function(sv){
					sv.setAttribute("id","medit-" + (index++) + "-" + meditId );
				});
			}
		});
	}
	
	medit.prototype.getContent = function(isEdit){
		isEdit = isEdit || false;
		if(!isEdit && toolBar.style.display == "block"){
			mainDo(1, "ok");
		}
		var html = this.node.innerHTML;
		if(regIsNotContentEmpty.test(html)){
			html = html.replace(selectTextReg,"$1");
			return html.replace(regContent, "");
		}
			
		return "";
	}
	
	medit.prototype.autoSave = function(appId, callBack){// 自动保存 callBack(data, timeStamp),自动恢复已保存数据
		if(window.localStorage){
			
			var oldData = localStorage.getItem("medit-autosave-"+appId);
			var temData = this.getContent(true);
			if(!regIsNotContentEmpty.test(temData) && oldData){
				meditId = this.node.getAttribute("data-meditid");
				this.node.innerHTML = oldData;
				this.updateId(0);
			}
			
			clearInterval(this.autoSaveInterval);
			var _this = this;
			this.autoSaveInterval = setInterval(function(){
				var nowData = _this.getContent(true);
				localStorage.setItem("medit-autosave-"+appId,nowData);
				callBack(nowData, (new Date())-0);
			},1000);
		}
	}
		
	
	medit.prototype.editContainFocus = function(e) {
		
		e = e || window.event;
		var target = e.target || e.srcElement;
		
		if(isContainMove){
			e.preventDefault();
			e.stopPropagation();
			isContainMove = false;
			return;
		}
		
		toolBarDisplay();
		
		if(meditId != null) { // 在已经选择某个区块的时候选择其它的，会先调用这个区块的blur
			var temObj = container[meditId];
			var temNode = document.getElementById("medit-" + temObj.nowNodeId + "-" + meditId);
			if(temNode){
				var temNodeMode = temNode.getAttribute("data-meditMode");
				if(mode[temNodeMode].empty && mode[temNodeMode].empty(temNode) && temNode != target){
					temNode.parentNode.removeChild(temNode);
					temObj.updateId(temObj.nowNodeId);
				}else{
					if(mode[temNodeMode].blur){
						mode[temNodeMode].blur(temNode);
					}
				}
				
			}
		}
		
		var type = target.getAttribute("data-medit");
		if(!type && target.getAttribute("data-meditId")){ // target is container
			meditId = target.getAttribute("data-meditId"); // 全局存贮当前medit容器ID
			var meditObj = container[ meditId];
			var child = target.children;
			if(!child.length){ // 如果点击了容器发现没有结点，那么就保存原有内容，并且创建新的span
				meditObj.preHTML = target.innerHTML;
				target.innerHTML = "";
				
				meditObj.createSpan(0);
				
				target = false;
			}else{
				var temTarget = child[child.length-1];
				var temTargetMode = temTarget.getAttribute("data-meditMode");
				if(!mode[temTargetMode].empty || !mode[temTargetMode].empty(temTarget)){
					meditObj.createSpan(child.length-1,temTarget, true);
					target = false;
				}else{
					target = temTarget;		
					nowNode = target;
				}
					
			}
		}else{ // target is 内部包含结点
			while(!target.getAttribute("data-medit")){
				target = target.parentNode;
			}
			nowNode = target;
		}
		
		if(target){
			if(!target.id) {
				var parentNode = target.parentNode;
				while(!parentNode.getAttribute("data-meditid")){
					parentNode = parentNode.parentNode;
				}
				meditId = parentNode.getAttribute("data-meditid");
				container[meditId].updateId();
			}
			var idExecRes = regNodeId.exec(target.id);
			meditId = Number(idExecRes[2]);
			var meditObj = container[ meditId];
			meditObj.nowNodeId = Number(idExecRes[1]);		
				
			var meditNodeMode = target.getAttribute("data-meditMode");
			
			toolBarModeSetting(meditNodeMode, mode[meditNodeMode].setting);
			
			if(mode[meditNodeMode].focus){
				mode[meditNodeMode].focus(target);
			}
		}	
	}
	
	obj.Medit = obj.medit = medit;
	
})(this);