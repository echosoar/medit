![logo](./images/logo.png)
# Medit

A creative WYSIWYG rich text editor for mobile device by javascript.

一个创新型的移动端所见即所得富文本编辑器。

Website Adress : [https://medit.js.org](https://medit.js.org)

##### 仅支持移动端 Only Support Mobile!

***

### How to use 如何使用：
	
	// first, import "medit.js" to your html file.
    <script src="../src/medit.js"></script>
	
	// second, initial object,you can use "new medit(DOM Element)" or "medit(DOM Element)".
	var meditObject = medit(document.getElementById("meditContainer"));
	
	// if you wanna get content
	meditObject.getContent();
	
	// if you wanna auto save
	meditObject.autoSave("autoSaveId", function(data, timestamp){
		console.log(data, timestamp);
	});
	

***

© 2017 echosoar