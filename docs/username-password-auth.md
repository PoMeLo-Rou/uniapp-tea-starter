# 用户名密码登录改造说明

本前端已将微信授权登录改为用户名密码登录/注册。后端和数据库需要统一使用 `username` 与 `role` 字段识别用户身份，管理员身份不再由前端本地白名单判断。

## 数据库字段建议

用户表可以统一为 `user` 或 `member`，关键字段如下：

```sql
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  points INT NOT NULL DEFAULT 0,
  coupons INT NOT NULL DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

`role` 建议只允许以下值：

```text
user  普通会员
admin 管理员
```

如果已有微信登录字段，例如 `openid`，可以保留但不再作为本项目登录主键。登录时只通过 `username` 查询用户，并通过 `role` 或 `isAdmin` 返回管理员身份。

## 前端调用接口

### 登录

```http
POST /api/auth/login
Content-Type: application/json
```

请求体：

```json
{
  "username": "admin",
  "password": "123456"
}
```

推荐响应：

```json
{
  "token": "Bearer xxx",
  "user": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "avatar": "",
    "phone": "",
    "role": "admin",
    "isAdmin": true,
    "points": 0,
    "coupons": 0,
    "balance": 0
  }
}
```

### 注册

```http
POST /api/auth/register
Content-Type: application/json
```

请求体：

```json
{
  "username": "tea_user",
  "password": "123456",
  "nickname": "茶饮用户"
}
```

注册用户默认 `role = 'user'`。管理员账号应通过数据库后台或管理脚本设置：

```sql
UPDATE user SET role = 'admin' WHERE username = 'admin';
```

### 当前用户

```http
GET /api/auth/me
Authorization: Bearer xxx
```

返回当前登录用户信息，字段与登录响应中的 `user` 保持一致。

## 前端身份判断规则

前端会员状态保存在 `stores/modules/member.js`。管理端权限判断优先使用后端返回字段：

```text
role === 'admin'
isAdmin === true 或 1
roles 包含 admin
permissions 包含 product:manage 或 admin:*
```

建议后端统一返回 `role`，这样用户端和管理端都能保持一致。
