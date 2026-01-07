# 管理员账号设置指南

## 创建管理员账号

Sdecky 的管理员账号必须在 Supabase 后台手动创建。这是为了安全考虑，防止任何人都能注册成为管理员。

### 步骤

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com
   - 登录你的账号
   - 选择 Sdecky 项目

2. **创建用户**
   - 左侧菜单选择 **Authentication** → **Users**
   - 点击右上角 **Add User** 按钮
   - 选择 **Create new user**

3. **填写用户信息**
   ```
   Email: humbleguava@gmail.com
   （必须是 .env.local 中 ADMIN_EMAILS 里的邮箱）

   Password: 设置一个安全的密码
   （至少 6 位字符）

   Auto Confirm User: ✅ 勾选这个选项
   （这样就不需要邮箱确认了）
   ```

4. **创建用户**
   - 点击 **Create User** 按钮
   - 用户创建成功！

5. **登录管理后台**
   - 访问 http://localhost:3000/auth/login
   - 输入刚才创建的邮箱和密码
   - 登录成功后会自动重定向到 `/admin`

## 管理员权限

管理员邮箱在 `.env.local` 中配置：

```env
ADMIN_EMAILS=humbleguava@gmail.com
```

**重要**：
- 只有在 `ADMIN_EMAILS` 列表中的邮箱才能访问 `/admin` 路由
- 可以添加多个管理员，用逗号分隔：
  ```env
  ADMIN_EMAILS=admin1@example.com,admin2@example.com
  ```
- 修改 `ADMIN_EMAILS` 后需要重启开发服务器

## 重置管理员密码

如果忘记密码：

1. **方法 1：在 Supabase Dashboard 重置**
   - Authentication → Users
   - 找到对应用户
   - 点击 "..." → Send password recovery
   - 或直接删除用户重新创建

2. **方法 2：使用忘记密码功能**
   - 访问 http://localhost:3000/auth/forgot-password
   - 输入管理员邮箱
   - 点击重置链接设置新密码

## 安全建议

- ✅ 使用强密码（至少 12 位，包含大小写字母、数字、符号）
- ✅ 不要在代码中硬编码密码
- ✅ 定期更新管理员密码
- ✅ 不要分享管理员账号
- ❌ 不要在公开的代码仓库中提交 `.env.local` 文件
