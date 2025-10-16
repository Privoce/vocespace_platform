"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Spin, Empty, message, Card } from "antd";
import ReactMarkdown from "react-markdown";
import { HomeHeader } from "../../home/header";
import { SpaceCard } from "@/components/space/card";
import {
  Space,
  SpaceState,
  FrequencyInterval,
  SpaceType,
} from "@/lib/std/space";
import styles from "@/styles/space_about.module.scss";
import { MessageInstance } from "antd/es/message/interface";

// Mock space data - in real app this would come from API
const mockSpace: Space = {
  id: "1",
  name: "技术交流空间",
  desc: "分享最新的技术趋势和开发经验，与全球开发者一起讨论编程技术、架构设计和最佳实践。",
  created_at: Date.now() / 1000,
  start_at: Date.now() / 1000 + 3600,
  end_at: Date.now() / 1000 + 7200,
  freq: {
    interval: FrequencyInterval.Weekly,
    in_week: [1, 3, 5],
  },
  fee: 0,
  owner_id: "user1",
  owner_name: "张三",
  state: SpaceState.Active,
  sub_count: 1250,
  online_count: 45,
  url: "https://example.com/space1",
  images: [
    "https://picsum.photos/800/400?random=1",
    "https://picsum.photos/800/400?random=2",
    "https://picsum.photos/800/400?random=3",
    "https://picsum.photos/800/400?random=4",
  ],
  ty: SpaceType.Tech,
  readme: `# 技术交流空间

欢迎来到我们的技术交流空间！这里是开发者们聚集的地方，我们一起分享知识、探讨技术趋势，共同成长。

## 🎯 空间目标

- 分享最新的技术趋势和开发经验
- 讨论编程技术、架构设计和最佳实践
- 建立开发者社区，促进技术交流
- 提供学习资源和职业发展建议

## 📅 活动安排

我们每周会举办以下活动：

- **周一**: 前端技术分享 (React, Vue, Angular等)
- **周三**: 后端架构讨论 (Node.js, Python, Java等) 
- **周五**: 开源项目展示和代码审查

## 🔧 技术栈覆盖

### 前端开发
- React / Vue / Angular
- TypeScript / JavaScript
- CSS / Sass / Tailwind
- Next.js / Nuxt.js / SvelteKit

### 后端开发  
- Node.js / Python / Java / Go
- Express / Django / Spring Boot
- 数据库设计和优化
- 微服务架构

### DevOps & 工具
- Docker / Kubernetes
- CI/CD 流水线
- 云平台 (AWS, Azure, GCP)
- 监控和日志管理

## 💡 如何参与

1. **加入空间**: 点击"加入空间"按钮
2. **参与讨论**: 在每周的固定时间参与技术讨论
3. **分享经验**: 主动分享你的项目经验和技术见解
4. **提问交流**: 遇到技术问题随时提问，大家互相帮助

## 🏆 空间特色

> "在这里，每个人都是老师，每个人也都是学生"

- **实战导向**: 我们不只是理论讨论，更注重实际项目经验
- **包容环境**: 无论你是新手还是专家，都能找到适合的交流方式
- **资源共享**: 定期分享优质的学习资源、工具和最佳实践
- **职业发展**: 提供技术面试指导和职业规划建议

## 📞 联系我们

如果你有任何问题或建议，可以随时联系空间管理员：

- 邮箱: tech-space@example.com
- 微信群: 扫描二维码加入
- GitHub: [TechSpace Organization](https://github.com/techspace)

期待与你在技术的道路上相遇！🚀`,
};

interface SpaceAboutProps {
  spaceId?: string;
  messageApi: MessageInstance;
}

export default function SpaceAbout({ spaceId, messageApi }: SpaceAboutProps) {
  const searchParams = useSearchParams();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const id = spaceId || searchParams?.get("spaceId");

  useEffect(() => {
    const fetchSpace = async () => {
      if (!id) {
        setError("Space ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In real app, fetch data based on ID
        setSpace(mockSpace);
        setError(null);
      } catch (err) {
        setError("Failed to load space information");
        message.error("加载空间信息失败");
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.spaceAbout}>
        <HomeHeader messageApi={messageApi} />
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className={styles.spaceAbout}>
        <HomeHeader messageApi={messageApi} />
        <div className={styles.error}>
          <div className={styles.errorTitle}>出现错误</div>
          <div className={styles.errorMessage}>{error || "未找到空间信息"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.spaceAbout}>
      <HomeHeader messageApi={messageApi} />

      <div className={styles.container}>
        {/* Left Content - Images and README */}
        <Card className={styles.leftContent}>
          {/* Image Gallery */}
          <div className={styles.imageGallery}>
            {space.images && space.images.length > 0 ? (
              <>
                <img
                  src={space.images[selectedImageIndex]}
                  alt={`${space.name} - ${selectedImageIndex + 1}`}
                  className={styles.mainImage}
                />
                <div className={styles.imageList}>
                  {space.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${space.name} - ${index + 1}`}
                      className={`${styles.imageItem} ${
                        index === selectedImageIndex ? styles.selected : ""
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noImages}>暂无宣传图片</div>
            )}
          </div>

          {/* README Section */}
          <div className={styles.readmeSection}>
            <h2 className={styles.sectionTitle}>空间介绍</h2>
            {space.readme ? (
              <div className={styles.readmeContent}>
                <ReactMarkdown>{space.readme}</ReactMarkdown>
              </div>
            ) : (
              <div className={styles.noReadme}>暂无详细介绍</div>
            )}
          </div>
        </Card>

        {/* Right Content - Space Card */}
        <div className={styles.rightContent}>
          <SpaceCard {...space} style={{ margin: 0 }} />
        </div>
      </div>
    </div>
  );
}
