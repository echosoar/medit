;(function(obj, undefined){

	
	var meditId = null;

	var container = [];
	
	var regNodeId = /medit\-(\d+)\-(\d+)$/;
	
	var isToolMove = false;
	
	var nowMode = "text";
	
	var mode = {
		"text":{
			focus:function(node) {
				node.setAttribute("contentEditable","true");
				node.setAttribute("class","medit-editing");
			},
			blur:function(node) {
				node.setAttribute("contentEditable","false");
				node.setAttribute("class","");
			}
		}
	}
	
	var isType = function(ele, type){
		if(!ele || !type)return false;
		return {}.toString.call(ele).slice(8, -1).toLowerCase() === type.toLowerCase();
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
		
		var mainButton = ["addLeft","delete","setting","mode","ok","addRight"];
		mainButton.forEach(function(v){
			var temNode = document.createElement("span");
			temNode.setAttribute("class","medit-tool-button medit-tool-"+v);
			temNode.setAttribute("data-meditToolStyle",v);
			temNode.setAttribute("data-meditToolDegree",1);
			tool.appendChild(temNode);
		});
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
			var contain = container[meditId];
			var thisNode = document.getElementById("medit-" + contain.nowNodeId + "-" + meditId);
			if(degree == 1) {
				switch(type){
					case 'delete':
						contain.node.removeChild(thisNode);
						toolBarHidden();
						break;
					case 'ok':
						if(mode[nowMode].blur){
							mode[nowMode].blur(thisNode);
						}

						if(thisNode.innerHTML=="") contain.node.removeChild(thisNode);;
						toolBarHidden();
						contain.nodeCount++;
						break;
				}
			}
			if(!contain.node.children.length) contain.node.innerHTML = contain.preHTML || "Medit";
		});
		
		return tool;
		
	})();
	
	var toolBarDisplay = function() {
		toolBar.style.display = "block";
	}
	
	var toolBarHidden = function() {
		toolBar.style.display = "none";
	}
	
	var medit = function(node) {
		if(!(this instanceof medit)) return new medit(node);
		
		if(!node || node.nodeType != 1)return false;
		
		this.node = node;
		this.nodeCount = 0; // 容器所有子元素数目
		this.nowNodeId = 0;	// 容器当前子元素ID
		
		this.node.setAttribute("data-meditId",container.length);
		
		container.push(this);
		
		gevent(this.node, ["touchstart"], this.editContainFocus);
		gevent(this.node, ["keydown", "keyup"], function(e){
			console.log(e);
		});
	}
	
	
	
	medit.prototype.createSpan = function(nodeId){
		var span =document.createElement("span");
		span.setAttribute("data-medit","true");
		span.setAttribute("data-meditMode","text");
		span.setAttribute("id","medit-" + nodeId + "-" + meditId );
		span.setAttribute("contentEditable","true");
		span.setAttribute("class","medit-editing");
		this.node.appendChild(span);
	}
	
	medit.prototype.editContainFocus = function(e) {
	
		toolBarDisplay();
		
		if(meditId != null) { // 在已经选择某个区块的时候选择其它的，会先调用这个区块的blur
			var temObj = container[meditId];
			var temNode = document.getElementById("medit-" + temObj.nowNodeId + "-" + meditId);
			if(temNode){
				var temNodeMode = temNode.getAttribute("data-meditMode");
				if(mode[temNodeMode].blur){
					mode[temNodeMode].blur(temNode);
				}
			}
		}
		
		e = e || window.event;
		var target = e.target || e.srcElement;
		
		var type = target.getAttribute("data-medit");
		if(!type && target.getAttribute("data-meditId")){ // target is container
			
			meditId = target.getAttribute("data-meditId"); // 全局存贮当前medit容器ID
			var meditObj = container[ meditId];
			var child = target.children;
			if(!child.length){ // 如果点击了容器发现没有结点，那么就保存原有内容，并且创建新的span
				meditObj.preHTML = target.innerHTML;
				target.innerHTML = "";
				meditObj.createSpan(0);
				return;
			}else{
				target = child[child.length-1];
			}
		}else{ // target is 内部包含结点
			while(!target.getAttribute("data-medit")){
				target = target.parentNode;
			}
		}
		
		if(!target.id) {
			initFromData(target);
		}
		
		var idExecRes = regNodeId.exec(target.id);
		meditId = Number(idExecRes[2]);
		var meditObj = container[ meditId];
		meditObj.nowNodeId = Number(idExecRes[1]);
			
			
		var meditNodeMode = target.getAttribute("data-meditMode");
		if(mode[meditNodeMode].focus){
			mode[meditNodeMode].focus(target);
		}
			
	}
	
	obj.Medit = obj.medit = medit;
	
})(this);