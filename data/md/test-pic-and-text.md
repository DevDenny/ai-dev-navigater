---
title: test pic and text
description: test pic and text
date: '2024-12-13T01:09:51.730Z'
---
# 环境安装与搭建
## 安装Node
- http:nodejs.org 官网下载最新版
- 点击继续，一路安装成功。无难度。没遇到坑。
- 验证安装是否成功.
```  
    node -v
    npm -v
```
![[Pasted image 20240512000309.png]]
![[Pasted image 20240512000358.png]]

## 安装Typescript

- 终端执行
```
npm install typescript -g
```
- 遇到了坑：淘宝境像变了，导致报错，如下:
![[Pasted image 20240512000639.png]]
- 解决方法
	1. 执行npm config list，如图
	![[Pasted image 20240512000836.png]]
	就是它变了。要改。
	2. 执行如下：
	```
	npm cache clean --force
	npm config set registry https://registry.npmmirror.com
	```
	3. 最后在执行,成功。
	```
	npm install -g typescript
	```
## 安装 ts-node
```
npm install -g ts-node
```
解决编码调试过程中，直接ts-node tsDemo.ts 运行代码，省去tsc tsDemo.ts过程。
