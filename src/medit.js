;(function(obj, undefined){

	var toolBar = (function(){
		
		var temTool = document.createElement("div");
		temTool.setAttribute("id","medit-tool");
		document.body.appendChild(temTool);
		
		var tool = document.getElementById("medit-tool");
		
		["addLeft","delete","style","ok","addRight"].forEach(function(v){
			var temNode = document.createElement("span");
			temNode.setAttribute("class","medit-tool-button medit-tool-"+v);
			temNode.setAttribute("data-meditToolStyle",v);
			temNode.setAttribute("data-meditToolDegree",1);
			tool.appendChild(temNode);
		})
		
		return tool;
		
	})();
	
	console.log(toolBar);

	var container = [];
	
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
	
	
	
	var medit = function(node) {
		if(!(this instanceof medit)) return new medit(node);
		
		if(!node || node.nodeType != 1)return false;
		
		this.node = node;
		
		this.node.setAttribute("data-meditId",container.length);
		
		container.push(this);
		
		gevent(this.node, ["touchstart", "click"], this.editContainFocus);
		gevent(this.node, ["keydown", "keyup"], console.log);
	}
	
	medit.prototype.createSpan = function(){
		var span =document.createElement("span");
		span.setAttribute("data-medit","true");
		span.setAttribute("contentEditable","true");
		span.setAttribute("class","medit-editing");
		this.node.appendChild(span);
	}
	
	medit.prototype.editContainFocus = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		
		var type = target.getAttribute("data-medit");
		
		if(!type){ // target is container
			while(!target.getAttribute("data-meditId")){
				target = target.parentNode;
			}
			var meditObj = container[target.getAttribute("data-meditId")];
			
			var child = target.children;
			if(!child.length){
				meditObj.preHTML = target.innerHTML;
				target.innerHTML = "";
				console.log(meditObj.createSpan());
			}
			
			
		}
		
	}
	
	obj.Medit = obj.medit = medit;
	
})(this);