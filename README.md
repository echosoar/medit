![logo](./images/logo.png)
# Medit v2.0.0

**收简历啦，你离天猫只差一份简历：tengfei.ytf@alibaba-inc.com 微信：7425176 **

A creative WYSIWYG rich text editor for mobile device by javascript.

一个创新型的移动端所见即所得富文本编辑器。

Website Address : [https://medit.js.org](https://medit.js.org)

Demo: [Medit Demo](https://medit.js.org/demo.html)

##### 为了更专注做一个更具价值和体验的移动端富文本编辑器，所以Medit目前不支持Pc端使用，仅支持移动端。

***
### Medit2.0.0 较上一版本更新内容

1. 更易用的内容选择方式，目前已支持选取内容块后手势左右滑动选择、通过手机原生自带长按选择进行编辑操作。
2. 优化编辑器样式，把原有的图标、弹层和编辑器内部标识都进行了优化。
3. 开放功能扩展接口Medit.extend，可以通过这个接口来扩展更加丰富的内容。
4. 开放内置功能配置接口Medit.nativeSetting，开放内置弹层调用接口Medit.settingPage。
5. 工具条目前不在限制于页面顶部，用户可以对工具条进行自定义配置。

  
***
### 如何使用：

+ 第一步，引入medit.js文件，如果不下载使用icon包的话可能会导致部分功能性icon无法显示，icon存放于 __github/medit/build/images__ 下
```html
<script src="https://medit.js.org/build/medit.min.js"></script>
```
> 在第一步和第二步之间可以选择性的引入medit插件，也可以自己来书写medit插件，medit提供了两个方法，一个是 __medit.extend__ 方法来配置扩展插件，另外还有一个 __medit.nativeSetting__ 方法来配置内部功能，详情请看下面的 medit类方法。

+ 第二步，创建medit实例
```html
<script>
/*
 * var meditObj = medit(editerContainerNode [, toolBarContainer]);
 *
 * 这里的medit方法内部实现了自动new，所以可以使用new medit，也可以直接使用medit。
 *
 * editerContainerNode：这是必须的，代表的是编辑框的node结点。
 * toolBarContainer： 这是可选的参数，可以传入一个node结点来配置工具条位置，如果不传入那么就会固定在页面顶部。
 *
 * 下面是一个实例
 */
 var meditObj = medit(document.getElementById("medit"), document.getElementById("meditToolBar"));
</script>
```
+ 经过上面两步之后一个medit富文本编辑器就可以使用了。

***
### Medit实例方法

通过上面创建好的medit实例meditObj可以调用medit的方法来实现你想要的功能。

+ meditObj.getContent()
  获取medit编辑器中所编辑的内容结果。

+ meditObj.clear()
  清除medit编辑器的内容和自动保存在客户端浏览器中的内容。

+ meditObj.autoSave(name, callBack(content, time))
  配置medit自动保存，需要传入两个参数：
  + name：为了保证在同一页面引入两个编辑器后自动保存的效果，所以需要手动传入一个自动保存的字段名称，需要在页面中保持唯一性。
  + callBack(content, time)：这是自动保存的回调函数，每次medit自动保存后都会调用这个回调函数，并传入当前保存的编辑器内容content和当前时间戳time。

+ meditObj.image(option) || meditObj.imageUpload(option)
  medit图片上传配置，option是配置参数
  ```javascript
  { // 默认图片上传设置
		path:'https://sm.ms/api/upload', // 图片上传路径
		name:'smfile', // 图片上传文件参数
		size:0, // 大小限制，0为不限制大小
		timeout:0, // 上传超时时间，0为不限制
		ext:["jpg","jpeg","png","gif","bmp"], // 上传文件格式限制
		success:function(){}, // 上传成功回调
		error:function(){} // 上传失败回调
	}
  ```

***

### medit类方法

目前有三个medit类方法，所谓类方法就是直接通过medit类进行调用而不是通过medit实例进行调用。

+ medit.extend(config) 
  功能扩展方法，可以通过这个方法实现medit插件和功能扩展。
  config是一个对象，其中必须包括 __图标: icon__ 、 __其它类型模块转换为此类型模块时动作: doWhat__ 、 __模块得到焦点时动作: focus__ 、__模块失去焦点时动作: blur__ 和 __模块名称: name__ 这五个属性。其中icon可以是远程url，也可以是dataURL；name必须保持唯一，不能与内置功能名称产生冲突。

 下面是一个功能模块的完整配置属性：
 ```javscript 
 /* 
    icon: [String] 类型选择icon url
    name: [String] 类型名称
    isMerge: [Bollean] 是否开启相同内容自动合并
    notDisplay: [Bollean] 在选择模式的时候不显示,
    emptyNotDelete: [Bollean] 如果当前块只存在一个子节点并且这个子节点要删除的时候是否开启递归删除
    
    doWhat: [Function] 转换到此类型时会自动做哪些转换
    focus：[Function] 点击或此模块获取焦点时自动触发的函数
    blur：[Function] 此模块失去焦点时自动触发的函数
    empty: [Function] 什么时候当前模块为空
    selecting：[Function] 选择当前模块并且手指在屏幕上移动时触发的操作
    selected：[Function] 手指移动结束执行的操作
    setting: [Array(Object)] 当前模块可以进行哪些操作
     --	name: [String] 操作名称
     --	icon: [String] 操作按钮icon url
     --	doWhat: [Function/Array] 点击此操作按钮执行什么，或者是存在更深层次操作
 */
 ```
+ medit.nativeSetting(callBack(config, name))
  内部功能配置方法，会循环调用callBack，然后把内置功能的配置和名称传入，返回值应该是一个修改后的config，然后medit就会应用这个config，如果没有返回值那么medit也就不会做任何改动。

+ medit.settingPage(title, contentHTML, callBack)
  打开medit内置弹层，title是配置弹层顶部Title，contentHTML可以传入一段html文本作为弹层的内容，callBack是在弹层的ok按钮点击之后触发。

下面是一段应用medit类方法的实例：
```html
<script>
medit.extend({
	name: 'time',
	icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAClklEQVRYR8WXjW0VQQyExxUAHUAFJBWQVACpgFABoQJCBZAKgAqSVECogKQCSAVABUZf8B73s393QXorPa2ebs87Httjn2nHy3Z8v1YBcPfHkp5JeiHpYfzw4Vf8LiR9NbMfvY51AXD3A0lvJbH3rCtJ78yMvbqqANwdL99LOh5ZuZGEp3PjgIOZp6OznHtlZjCUXUUA7r4n6aMkdtZnSactegP0B0kv473rAMG+WFkAcfmXiPEtnplZ1kDJs7DxKRiBgcOcjQWA8IDL8Ry6D0oURlKqxErYIlSEBQcAMQlHDgCooQ/P92rxc3eHATOrhZI8SiAuzOxozNrkxaDtWxzYb9HeAwBbM7uwMCTwHABZ+5yEM7Nx5mdD3QsgQCRmr8zsMBkcAES8fsaDJ61sD6PNEKSLIl++x/9HKbRjAHhM2d2YWSq9qoisYSAAk4gkJNoAI/+k2N2p3dehYKd1/fr7dAMA7KKoQ4jHDJAY6PyArgViAwCU8jz6xZ2s5wBMsrQGIgFAITPnqHc8Heo+egoac21m+/8TQAnnGzMjtClkeA0AOmaRgclLDQYoW4SmtI7H1eTu1RCkJDwzs5NW/Lc8d/dqEqYyHOKz5ZIGY9UyhMpVQrQGYFOIoq6TXC6axprLcmfdPdm+NDNy4W7NewEzX5LL7nJsgZs1o4nM59pxSkbql47YPWAWPCe0OMW+aHKlgWQ8RBxtBdEz3JRGMtDi+YMYtwHRnHDHDITqIbvY+h3DzYLN3kkG24gOIlUNSWQ7DSfNE4x1zJTZ93rGcsSDLpkWhgDDngZV2jcJTHazp3UWk/T6sXxGJ0YBkkbtVuJ3jfCLMmxZjaSiieDx/CuJHIERRq6ix/M7uj7NWsDu83znAP4A8SpJMGG4znIAAAAASUVORK5CYII=',
	doWhat: function(node) {
		node.innerHTML = "this is time node";
		return node;
	},
	setting: [{
		name: 'time',
		icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAClklEQVRYR8WXjW0VQQyExxUAHUAFJBWQVACpgFABoQJCBZAKgAqSVECogKQCSAVABUZf8B73s393QXorPa2ebs87Httjn2nHy3Z8v1YBcPfHkp5JeiHpYfzw4Vf8LiR9NbMfvY51AXD3A0lvJbH3rCtJ78yMvbqqANwdL99LOh5ZuZGEp3PjgIOZp6OznHtlZjCUXUUA7r4n6aMkdtZnSactegP0B0kv473rAMG+WFkAcfmXiPEtnplZ1kDJs7DxKRiBgcOcjQWA8IDL8Ry6D0oURlKqxErYIlSEBQcAMQlHDgCooQ/P92rxc3eHATOrhZI8SiAuzOxozNrkxaDtWxzYb9HeAwBbM7uwMCTwHABZ+5yEM7Nx5mdD3QsgQCRmr8zsMBkcAES8fsaDJ61sD6PNEKSLIl++x/9HKbRjAHhM2d2YWSq9qoisYSAAk4gkJNoAI/+k2N2p3dehYKd1/fr7dAMA7KKoQ4jHDJAY6PyArgViAwCU8jz6xZ2s5wBMsrQGIgFAITPnqHc8Heo+egoac21m+/8TQAnnGzMjtClkeA0AOmaRgclLDQYoW4SmtI7H1eTu1RCkJDwzs5NW/Lc8d/dqEqYyHOKz5ZIGY9UyhMpVQrQGYFOIoq6TXC6axprLcmfdPdm+NDNy4W7NewEzX5LL7nJsgZs1o4nM59pxSkbql47YPWAWPCe0OMW+aHKlgWQ8RBxtBdEz3JRGMtDi+YMYtwHRnHDHDITqIbvY+h3DzYLN3kkG24gOIlUNSWQ7DSfNE4x1zJTZ93rGcsSDLpkWhgDDngZV2jcJTHazp3UWk/T6sXxGJ0YBkkbtVuJ3jfCLMmxZjaSiieDx/CuJHIERRq6ix/M7uj7NWsDu83znAP4A8SpJMGG4znIAAAAASUVORK5CYII=',
		doWhat: function(node){
			medit.settingPage("时间插件测试","Time test",function(){ console.log("ok点击了")});
		}
	}],
	focus: function(node){
		node.setAttribute("class","medit-editing");
	},
	blur: function(node) {
		node.removeAttribute("class");
	}
})

medit.nativeSetting(function(mode, modeName){
	console.log(mode, modeName);
});
</script>
```
***

© 2017 echosoar@ [iwenku.net](http://iwenku.net/)
