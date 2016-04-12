---
layout: post
title: "Android动画效果按钮"
description: "Android动画效果按钮"
category: Android
tags: [Android,Animation]
---
###Android Button 动画效果
简单实现按钮动画效果,效果图如下:	

收缩效果		
![收缩](../assets/shrink.jpg)		
展开效果		
![展开](../assets/expand.jpg)		

####主要实现方法
展开按钮组		
计算角度,得出偏移量,执行偏移动画,动画执行完后,设置新的位置,不设置位置,按钮是无法点击的		

	private void openButton(final View view,int index,int total,int radius){
		view.setVisibility(View.VISIBLE);
		
		double angle = Math.PI/2/(total-1)*index;
		final int x = (int) (Math.cos(angle)*radius);
		final int y = (int) (Math.sin(angle)*radius);
		Animation ani = new TranslateAnimation(0, x, 0, y);
		ani.setDuration(500);
		ani.setFillAfter(true);
		ani.setAnimationListener(new Animation.AnimationListener() {
			@Override
			public void onAnimationStart(Animation arg0) {}
			@Override
			public void onAnimationRepeat(Animation arg0) {}
			@Override
			public void onAnimationEnd(Animation ani) {
				FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) view.getLayoutParams();
				params.leftMargin += x;
				params.topMargin += y;
				view.setLayoutParams(params);
				view.clearAnimation();
			}
		});
		view.clearAnimation();
		view.startAnimation(ani);
	}

收缩按钮组		
原理跟展开一样

	private void closeButton(final View view,int index,int total,int radius){
		double angle = Math.PI/2/(total-1)*index;
		final int x = (int) (Math.cos(angle)*radius);
		final int y = (int) (Math.sin(angle)*radius);
		AnimationSet set = new AnimationSet(true);
		
		Animation trans = new TranslateAnimation(0, -x, 0, -y);
		set.addAnimation(trans);
		
		Animation alpha = new AlphaAnimation(1f, 0f);
		set.addAnimation(alpha);
		
		set.setDuration(500);
		set.setFillAfter(true);
		
		set.setAnimationListener(new Animation.AnimationListener() {
			
			@Override
			public void onAnimationStart(Animation arg0) {}
			
			@Override
			public void onAnimationRepeat(Animation arg0) {}
			
			@Override
			public void onAnimationEnd(Animation ani) {
				FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) view.getLayoutParams();
				params.leftMargin = mLeftMargin;
				params.topMargin = mTopMargin;
				view.setLayoutParams(params);
				view.clearAnimation();
				view.setVisibility(View.GONE);
			}
		});
		view.startAnimation(set);
	}

[下载地址](https://github.com/HonestHuang/ExpandButtonSample)