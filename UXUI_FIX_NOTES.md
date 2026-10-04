# Ghi chú thay đổi UX/UI Landing Page TrọƠi

## Phạm vi

Nhánh `fix-uxui` được tạo từ `main`. Source được chuyển từ bản HTML độc lập `TroOi-landing-fixed (1).html` về đúng cấu trúc website tĩnh trong thư mục `dist`.

Không thay đổi hai file thư viện Three.js và không cần thêm bước build hoặc npm.

## 1. Global Hero

**File:** `dist/index.html`, `dist/style.css`

- Đổi thông điệp mở đầu thành “Bạn có trọ. Tôi có nơi về.”
- Hero dùng chung cho Chủ trọ và Người thuê.
- Bổ sung hai hành động: khám phá hành trình và đi tới phần giới thiệu ứng dụng.
- Mở rộng canvas toàn màn hình ở Hero nhưng vẫn giữ nội dung dễ đọc bằng lớp nền chuyển sắc nhẹ.

## 2. Chương chọn vai trò

**File:** `dist/index.html`, `dist/style.css`, `dist/branch-ui.js`, `dist/role-scene.js`

- Chèn chương `#roles` giữa Hero và câu chuyện chi tiết.
- Cho phép chọn hoặc kéo giữa “Tôi là người thuê” và “Tôi là chủ trọ”.
- Sau khi chọn, các chương và liên kết điều hướng được cập nhật theo nhánh tương ứng.
- Thêm cảnh 3D hai nhân vật gặp nhau và ký hợp đồng.
- Giữ khả năng chuyển vai trò mà không cần quay lại đầu trang.

## 3. Câu chuyện Người thuê

**File:** `dist/index.html`, `dist/story.js`, `dist/timeline.js`

- Giữ lại chuỗi cảnh gốc: căn phòng, hóa đơn và sửa chữa.
- Điều chỉnh ánh xạ cuộn để chương chọn vai trò không làm lệch timeline cũ.
- Cập nhật điều hướng thành 6 điểm dừng.

## 4. Câu chuyện Chủ trọ

**File:** `dist/index.html`, `dist/landlord-scene.js`, `dist/branch-ui.js`

- Bổ sung ba chương: đăng phòng, chốt điện nước và kết nối khách thuê.
- Dùng một thế giới 3D liên tục để chuyển đổi mượt giữa ba chương.
- Canvas Chủ trọ được tách khỏi canvas người thuê để hai timeline không ghi đè trạng thái của nhau.

## 5. Hội tụ tại phần giới thiệu ứng dụng

**File:** `dist/index.html`, `dist/story.js`, `dist/branch-ui.js`

- Cả hai nhánh cùng kết thúc tại `#app`.
- Khi chọn chương cuối, trang dừng tại trạng thái hoàn chỉnh của cảnh ứng dụng.
- Header CTA chỉ xuất hiện khi người xem đã chọn một vai trò.

## 6. Sửa lỗi background

**File:** `dist/style.css`, `dist/story.js`, `dist/role-scene.js`, `dist/landlord-scene.js`

- Cố định nền gốc `#eef3e9` trên `html`, `body` và lớp nền toàn trang.
- Đặt `#stage`, `#landlord-stage`, `#roles-scene` và các canvas về nền trong suốt.
- Các WebGL renderer dùng `alpha: true`, `premultipliedAlpha: false` cho cảnh mới và clear color có alpha bằng `0`.
- Nếu trình duyệt không cung cấp WebGL alpha, scene dùng màu nền `#eef3e9` thay vì màu trắng.

Mục tiêu là loại bỏ hình chữ nhật trắng và đường cắt giữa nội dung với vùng 3D.

## 7. Font và khả năng đọc

**File:** `dist/style.css`

- Giữ font chính `Be Vietnam Pro` với fallback `Arial, sans-serif`.
- Khai báo đầy đủ weight `400–900` từ Google Fonts.
- Điều chỉnh kích thước, line-height và wrapping của tiêu đề cho desktop, mobile và màn hình thấp.
- Thêm lớp nền sáng mềm và text-shadow tại Hero để chữ không chìm vào mô hình 3D.

## 8. Cấu trúc source sau khi tách

- `dist/index.html`: nội dung, các chương và điểm gắn canvas.
- `dist/style.css`: toàn bộ giao diện và responsive.
- `dist/story.js`: timeline chung và câu chuyện Người thuê.
- `dist/branch-ui.js`: chọn vai trò, điều hướng và trạng thái hiển thị.
- `dist/role-scene.js`: cảnh 3D chọn vai trò.
- `dist/landlord-scene.js`: ba cảnh 3D Chủ trọ.
- `dist/timeline.js`: các mốc animation gốc.
- `dist/three.module.js`, `dist/three.core.js`: Three.js 0.180.0, không thay đổi.

## Kiểm tra local

```powershell
T:\Tools\Python314\python.exe -m http.server 8080 --directory T:\exe2\TroOi-Landing-Page\dist
```

Mở `http://localhost:8080`, kiểm tra cả hai lựa chọn vai trò, sáu điểm điều hướng, nền canvas và responsive.
