---
title: 测试-Redux快速体验
description: Redux快速体验
date: '2024-12-17'
category: test
categoryName: 教程
---

## Redux快速体验
### 实现一个计数器
步骤：
- 1.定义一个 reducer 函数 (根据当前想要做的修改返回一个新的状态)
- 2.使用createStore方法传入 reducer函数 生成一个store实例对象
- 3.使用store实例的 subscribe方法 订阅数据的变化(数据一旦变化，可以得到通知)
- 4.使用store实例的 dispatch方法提交action对象 触发数据变化(告诉reducer你想怎么改数据)
- 5.使用store实例的 getState方法 获取最新的状态数据更新到视图中

### Redux管理数据流程梳理
![[Pasted image 20240530102008.png]]
为了职责清晰，数据流向明确，Redux把整个数据修改的流程分成了三个核心概念，分别是:state、action和reducer
- 1.state-一个对象 存放着我们管理的数据状态
- 2.action-一个对象 用来描述你想怎么改数据
- 3.reducer--个函数 更具action的描述生成一个新的state

### 代码实现
```js
<script>
  // 1. 定义reducer函数 
  // 作用: 根据不同的action对象，返回不同的新的state
  // state: 管理的数据初始状态
  // action: 对象 type 标记当前想要做什么样的修改
  function reducer (state = { count: 0 }, action) {
    // 数据不可变：基于原始状态生成一个新的状态
    if (action.type === 'INCREMENT') {
      return { count: state.count + 1 }
    }
    if (action.type === 'DECREMENT') {
      return { count: state.count - 1 }
    }
    return state
  }

  // 2. 使用reducer函数生成store实例
  const store = Redux.createStore(reducer)

  // 3. 通过store实例的subscribe订阅数据变化
  // 回调函数可以在每次state发生变化的时候自动执行
  store.subscribe(() => {
    console.log('state变化了', store.getState())
    document.getElementById('count').innerText = store.getState().count
  })

  // 4. 通过store实例的dispatch函数提交action更改状态 
  const inBtn = document.getElementById('increment')
  inBtn.addEventListener('click', () => {
    // 增
    store.dispatch({
      type: 'INCREMENT'
    })
  })

  const dBtn = document.getElementById('decrement')
  dBtn.addEventListener('click', () => {
    // 减
    store.dispatch({
      type: 'DECREMENT'
    })
  })

  // 5. 通过store实例的getState方法获取最新状态更新到视图中

</script>
```

# Redux&React 环境准备
## 安装必要插件
创建项目
```java
npx create-react-app react-redux-pro
```

安装配套工具
```js
npm i @reduxjs/toolkit react-redux
```
启动项目
```js
npm run start
```
## 建立store目录
![[Pasted image 20240530105153.png]]
- 1.通常集中状态管理的部分都会单独创建一个单独的`store`目录
- 2.应用通常会有很多个子store模块，所以创建一个`modules`目录，在内部编写业务分类的子store
- 3.store中的入口文件 index.is 的作用是组合modules中所有的子模块，并导出store
![图片描述](https://raw.githubusercontent.com/DevDenny/ai-dev-navigater/main/uploads/images/1734405524003_0dy8tn.png)
