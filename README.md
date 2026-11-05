# Workshop Node API

REST API สำหรับจัดการผู้ใช้ สินค้า และคำสั่งซื้อ พัฒนาด้วย Express, MongoDB และ Mongoose

## สิ่งที่ต้องมี

- Node.js และ npm
- MongoDB 

## ติดตั้ง

```bash
git clone <repository-url>
cd workshop_node
npm install
```

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```env
DB_HOST=127.0.0.1
DB_PORT=27017
DB_NAME=workshop_node
jwtSecret=เปลี่ยนเป็น_secret_ที่ปลอดภัย
```

ตรวจสอบว่า MongoDB ทำงานอยู่และ database สามารถเชื่อมต่อได้ จากนั้นเริ่ม server:

```bash
npm start
```

server จะทำงานผ่าน `bin/www` โดยค่าเริ่มต้นของ Express คือพอร์ต `3000`:

```text
http://localhost:3000
```

## รูปแบบการยืนยันตัวตน

หลัง login จะได้รับ JWT ใน response ให้นำ token ส่งใน header `Authorization` ของ endpoint ที่ต้อง login:

```http
Authorization: <token ที่ได้จาก login>
```

หมายเหตุ: middleware ปัจจุบันตรวจ token ตรง ๆ จึงให้ส่ง JWT โดยไม่เติมคำว่า `Bearer` หากต้องการใช้รูปแบบมาตรฐาน `Bearer <token>` ต้องปรับ middleware เพิ่ม

## ลำดับการใช้งาน

1. สมัครสมาชิกด้วย `POST /api/v1/register`
2. Login ด้วย `POST /api/v1/login` เพื่อรับ token
3. ใช้ token เรียกดูหรือสร้างสินค้า
4. สร้าง order จาก product ที่ต้องการ
5. ดู order ของผู้ใช้ปัจจุบันผ่าน `GET /api/v1/orders`

## Users API

### สมัครสมาชิก

```http
POST /api/v1/register
Content-Type: application/json
```

```json
{
  "username": "alice",
  "password": "password123"
}
```

### Login

```http
POST /api/v1/login
Content-Type: application/json
```

```json
{
  "username": "alice",
  "password": "password123"
}
```

ตัวอย่าง response:

```json
{
  "message": "success",
  "token": "<jwt-token>"
}
```

### อนุมัติผู้ใช้

เฉพาะผู้ใช้ที่มี role เป็น `admin` เท่านั้น

```http
PUT /api/v1/users/:id/approve
Authorization: <admin-token>
```

## Products API

ทุก endpoint ในส่วนนี้ต้องส่ง `Authorization` header

### ดูสินค้าทั้งหมด

```http
GET /api/v1/products
Authorization: <token>
```

### สร้างสินค้า

```http
POST /api/v1/products
Authorization: <token>
Content-Type: application/json
```

```json
{
  "productName": "Keyboard",
  "stockLeft": 10
}
```

ผู้สร้างสินค้าจะถูกบันทึกจาก `userId` ใน token โดยอัตโนมัติ

### ดูสินค้ารายการเดียว

```http
GET /api/v1/products/:id
Authorization: <token>
```

### แก้ไขสินค้า

ปัจจุบัน route ใช้ `PUT` แต่รองรับการส่งเฉพาะ field ที่ต้องการแก้ไขได้ เช่น เปลี่ยนชื่อโดยไม่เปลี่ยน stock:

```http
PUT /api/v1/products/:id
Authorization: <token>
Content-Type: application/json
```

```json
{
  "productName": "Mechanical Keyboard"
}
```

หรือแก้ stock:

```json
{
  "stockLeft": 20
}
```

ผู้ใช้แก้ไขได้เฉพาะสินค้าที่ตนเองสร้าง

### ลบสินค้า

```http
DELETE /api/v1/products/:id
Authorization: <token>
```

ผู้ใช้ลบได้เฉพาะสินค้าที่ตนเองสร้าง

## Orders API

### สร้าง order ของสินค้า

```http
POST /api/v1/products/:id/orders
Authorization: <token>
Content-Type: application/json
```

```json
{
  "quantity": 2
}
```

เมื่อสร้างสำเร็จ ระบบจะลด `stockLeft` ของสินค้าตามจำนวนที่สั่ง หาก stock ไม่พอจะตอบกลับ status `400`

### ดู order ทั้งหมดของ product

```http
GET /api/v1/products/:id/orders
Authorization: <token>
```

### ดู order ของผู้ใช้ที่ login อยู่

```http
GET /api/v1/orders
Authorization: <token>
```

ข้อมูล `productId` ใน response จะถูก populate เป็นข้อมูลสินค้า โดยเลือกเฉพาะ `productName` และ `stockLeft`


## โครงสร้างสำคัญ

```text
app.js                       ตั้งค่า Express และ mount routes
bin/www                      จุดเริ่มต้น server
db.js                        เชื่อมต่อ MongoDB
routes/users.js              register, login และ approve user
routes/products.js           จัดการสินค้าและสร้าง order
routes/orders.js             ดู order ของผู้ใช้
models/                      Mongoose schemas
middleware/token.middleware.js  ตรวจสอบ JWT
```
