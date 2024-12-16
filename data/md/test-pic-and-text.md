---
title: 每月3500的AI码农Devin，还是140的编程神器Cursor？实测来了
description: test pic and text
date: '2024-12-16'
category: test
categoryName: 教程
---
![图片](https://raw.githubusercontent.com/DevDenny/ai-dev-navigater/main/uploads/images/1734311396362_uz2eqa.png)

> 狠人来了，昨天Devin刚发布，今天网友Steve (不是普通网友Builder.io的CEO)就花了500美金订阅了，并与20美金的编程神器Cursor进行的对比评测，看完你再决定是否用3500一个月的Devin还是140的Cursor吧

**以下是评测结果，我整理总结了一下分享给大家（视频中英文字幕版附在文后）**

### **Devin 主要基于 Slack 工作流：**

Devin 主要通过 Slack 交互，而非 IDE 集成。用户在 Slack 中标记 @devin 并提出请求，例如更新代码、修复 bug 等。Devin 的界面包括远程服务器、浏览器、VS Code 编辑界面和计划器，用户可以逐步查看 Devin 的操作和进度

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### **Devin 的实际测试：**

Steve首先测试了一个可以在消费级硬件上运行的小型图像生成模型。由于他不懂 Python 也不知道如何操作，便请求 Devin 帮他运行。Devin 成功克隆了代码库，启动程序，并生成了想要的猫咪图片。随后，Steve又要求它生成四张狗狗乘坐热气球的图片，虽然生成的图像质量略显惊悚 (这当然不是 Devin 的错，而是模型本身的问题)，但 Devin 的确完成了任务。

接着，Steve尝试让 Devin 为这个图像生成模型添加一个基于 Web 的 UI 界面，以便输入提示词并查看生成的图像。Devin 开始工作并发送更新，过程中它会记录笔记并存储在 notes.txt 文件中，以便在后续步骤中引用和使用，这似乎是一种总结重要信息并跨步骤传递的有效方法。Devin 有时还会创建“知识条目”，即一些可能在后续子令牌运行中用到的有用信息片段，并将其存储和查找，模拟团队内部的知识积累。

总的来说，Devin 表现出色。它能够创建计划、编写代码、查找和修复代码中的 bug，甚至进行端到端测试以验证功能。它还能响应用户反馈并尝试解决问题。任何你在 Slack 中的回复，Devin 都会尝试回复。例如，它能够识别部署问题并持续调试，虽然最终未能解决问题，但其努力尝试的过程值得肯定

## **Devin 的一些问题：**

**工作流程不理想：** Devin 的工作流程并非个人偏好。提交请求后等待 15 分钟才能收到 PR，然后在 PR 上来回沟通。个人更喜欢在本地 IDE 中进行所有操作，实时查看更新，并在本地提交和调试，而无需跳转到远程服务器和其他不熟悉的工具，以及忍受漫长的等待和延迟

**可靠性有待提高：** Devin 的理念是让异步代理同事处理任务，并并行执行多项操作，最终向你提供结果。但这只有在 Devin 足够可靠的情况下才是一个高效的工作流程。让 AI 自己去执行任务，除非你非常确信它能够可靠地完成。否则，宁愿使用自己的 IDE 来完成

**其他 bug：** 在测试过程中，Devin 还出现了一些其他问题，例如无法正确生成拉取请求、添加不必要的代码、无法响应反馈等，虽然这些问题并非无法解决，但也影响了使用体验。

## **与 Cursor 的比较**

与 Devin 相比，Cursor 代理的优势在于无需手动添加文件到上下文，它会自动扫描代码库并添加相关文件。在同样的任务中，Cursor 代理能够快速准确地完成代码修改，并且能够实时控制和查看更新，无需等待和跳转到其他工具。这种实时交互和掌控感让你对 Cursor 代理更有信心。

在 GraphQL 后端功能的测试中，Cursor 代理也取得了与 Devin 类似的结果，成功添加了 Comments Resolver 并将其集成到 API 中。此外，Cursor 代理在运行命令前会进行确认，更加谨慎，这对于在本地机器上运行的工具来说是一个重要的优势

**总结：**

虽然 Devin 在 AI 编码领域展现出一定的潜力，但它不太可能像 Cursor 那样迅速普及。这不仅仅是因为 500 美元的月费，更重要的是 **Cursor 代理更容易上手，其增量式方法也更符合个人的工作习惯。Devin 试图一步到位，并以代理驱动开发的新方式为噱头筹集资金（据说devin已经估值20亿美金了），但这并不是理想中的工作流程。也许当大型语言模型更加完善，代理更加可靠时，Devin 的价值才能真正体现出来。但个人更看好 Cursor 的增量式方法，而不是 Devin 的全面改革式方法**

尽管如此，仍然很高兴看到 AI 编码领域出现新的竞争者，这将推动 Cursor 进一步发展。期待看到 Devin 的未来发展

**⭐星标AI寒武纪，好内容不错过**⭐****

**用你的****赞****和****在看****告诉我～**

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

求赞👇👇

![图片](/uploads/images/2024-12/1734310512877_10f137f3df360cf3.png)

