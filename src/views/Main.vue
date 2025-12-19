<template>
    <el-row class="main" :gutter="8">
        <el-col :span="8" style="margin-top: 20px;">

            <!--卡片信息显示-->
            <el-card shadow="hover" class="user-info-card">
                <div class="user">
                        <img :src="getImageURL('user')" class="user" />
                        <div class="user-info">
                            <p class="user-info-admin">Admin</p>
                            <p class="user-info-p">管理员</p>
                        </div>
                    </div>
                    <div class="login-info">
                        <p>最后登录时间：<span>2002-12-01 12:00:00</span></p>
                    </div>
                </el-card>
        </el-col>
    </el-row>

    <!--信息栏-->
    <el-row style="margin-top: 20px;">
        <el-col :span="16">
            <div class="info-bar">
                <div class="info-links">
                    <div class="info-item">
                        <div>
                            <p>校园资讯链接：</p>
                        </div>
                        <a href="https://news.fzu.edu.cn/info/1011/120173.htm" target="_blank" class="info-link">校领导深入学生社区开展安全检查并部署推进社区建设</a>
                        <span class="info-time">2025-10-11</span>
                    </div>
                    <div class="info-item">
                        <a href="https://news.fzu.edu.cn/info/1011/119368.htm" target="_blank" class="info-link">校领导深入一线检查研究生公寓及生活区电动车停车点建设情况</a>
                        <span class="info-time">2025-8-20</span>
                    </div>
                    <div class="info-item">
                        <a href="https://weibo.com/1870688711/O2cAIoFdo" target="_blank" class="info-link">#小福笔记# 
【一定要知道！正确使用电动车，预防电动车火灾】各位FZUer日常通勤，难免需要使用使用电动自行车，正确使用电动车，切记不要在住宅内充电，也不要“飞线充电”。9张图教会你如何预防电动自行车火灾？</a>
                        <span class="info-time">2024-2-25</span>
                    </div>
                    <div class="info-item">
                        <a href="https://gxt.fujian.gov.cn/zwgk/zfxxgk/fdzdgknr/gfxwj/202306/t20230609_6185075.htm" target="_blank" class="info-link">福建省工业和信息化厅等十部门关于印发全面推进“电动福建”建设的实施意见（2023—2025年）的通知</a>
                        <span class="info-time">2023-6-9</span>
                    </div>
                </div>
            </div>
        </el-col>
    </el-row>

</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const getImageURL = (user) => {
    return new URL(`../assets/image/${user}.png`, import.meta.url).href
}

axios(
    {
        method: 'get',
        url: '/api/user/info'
    }
)

</script>

<style scoped lang="less">
.main {
    .user {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #ccc;
        margin-bottom: 20px;

        img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin-right: 20px;
        }

        .user-info {
            p {
                line-height: 40px;
            }

            .user-info-p {
                color: #999;
            }

            .user-info-admin {
                font-size: 36px;
                font-weight: bold;
            }
        }
    }
}

.login-info {
    p {
        line-height: 30px;
        font-size: 14px;
        color: #999;

        span {
            color: #666;
            margin-left: 60px;
        }
    }
}

.info-bar {
    margin-top: 20px;
    min-height: calc(100vh - 200px);
    .info-links {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .info-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        background-color: #fafafa;
        margin-bottom: 10px;
    }
    .info-link {
        color: #409eff;
        text-decoration: none;
        font-weight: bold;
    }
    .info-link:hover {
        text-decoration: underline;
    }
    .info-time {
        color: #909399;
        font-size: 12px;
    }
}
</style>