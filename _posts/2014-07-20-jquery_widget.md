---
layout: post
title: "jQuery插件制作"
description: "简单的jQuery插件制作教程"
category: JQuery
tags: [JQuery]
---
####jQuery插件制作

######声明插件函数
首先,必须在jQuery中声明的插件的名称

	$.fn.yourwidget = function(){
		some code...
	};
这样jQuery对象就直接调用改函数

	$('your jquery object').yourwidget();

######设置插件选项
如果需要一些个性化设置,可以在声明函数时,传入一些需要的参数,如配置信息,或者回调函数

	$.fn.yourwidget = function(options){
		$.extend({
			setting:null,
			callback:null
			},options);
	}
在使用插件时候,就能设置参数

	$('your jquery object').yourwidget({setting:1,callback:function(){...}});

######设置插件方法
插件还能在jQuery对象设置一些常用的方法

	this.yourfunction = function(){
		...
	}
你可以在jQuery对象上直接使用这个方法

	$('your jquery object').yourunction();

######Demo
最后是一个简单的[Demo](../assets/jquery-widget-demo.html)