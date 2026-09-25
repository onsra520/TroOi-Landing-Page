# TrọƠi — Infinitown redesign

Ngày: 25/09/2026. Trạng thái: APPROVED, được phép triển khai. Runtime redesign chưa được triển khai trong phiên này.

Repo đích: `onsra520/TroOi-Landing-Page`. Nhánh triển khai: `feat/infinity-town`.

Người dùng đã chốt spec và cho phép implement trên nhánh này. Giữ phương thức Native đã chọn, thực hiện inline, không cần xin duyệt lại spec. Viết implementation plan dựa trên checkout thực tế trước khi sửa runtime. Không push, merge hoặc deploy theo quyết định trước.

## 1. Mục tiêu và nền tảng

Landing page cần gây ấn tượng bằng một khu phố 3D dày, có kiến trúc phong phú, hình ảnh sắc nét và kéo vô tận. Website là mặt tiền marketing của TrọƠi; các nghiệp vụ quản lý trọ vẫn nằm trong app.

Reference người dùng chọn:
- Hình ảnh và hướng redesign: https://kkhanhluu.github.io/infinitown/
- Tương tác: https://demos.littleworkshop.fr/infinitown/
- Source cần khảo sát khi triển khai: https://github.com/kkhanhluu/infinitown

Kế thừa AssetLibrary, KayKit, roads và VehicleSystem của bản hiện tại khi phù hợp. Không dựng lại toàn dự án. Camera calibration cũ là điểm xuất phát; không thay góc nhìn để che khuyết điểm building.

Theo lịch sử bàn giao, baseline là branch feat/infinity-town, commit 7ef8f5f, đang local và chưa push. Workspace phiên này không chứa checkout đó. Các con số tests/performance cũ chưa được xác minh lại và không được coi là kết quả của redesign này. Spec chưa commit vào repo.

## 2. Những quyết định đã khóa

| Thành phần | Thiết kế |
|---|---|
| Camera | Giữ nguyên vị trí và hướng khi người dùng kéo |
| Pan | Mouse/touch kéo map trên mặt phẳng X/Z, Y không đổi |
| Zoom/orbit | Chưa có; wheel không điều khiển camera |
| Animation tương lai | CameraRig độc lập, có cơ chế khóa input; chưa thêm fly-through |
| Infinity | Pool hữu hạn hiển thị một thế giới tuần hoàn, không lộ rìa |
| Building | Cụm phố được bố trí sẵn, tăng mật độ và chi tiết mặt tiền/mái |
| Rendering | MSAA khi khả dụng, DPR theo thiết bị, texture/shadow được kiểm tra trực quan |
| Phạm vi | Redesign scene landing page; không thêm nghiệp vụ app |

## 3. Art direction

Giữ phong cách low-poly rõ hình khối. Phối nền tường kem, cát, đất nung nhạt; mái xanh xám, cửa kính tối; cây xanh có độ đậm khác nhau. Điểm nhấn TrọƠi dùng tiết chế ở biển hiệu và một công trình nhận diện. Đây là palette đề xuất, không phải màu thương hiệu đã xác nhận.

Foreground và midground phải có nhà nối tiếp nhau, cao thấp xen kẽ, thấy mặt đứng lẫn mái. Hạn chế khoảng sân rỗng vô mục đích. Giữ sidewalk, đường và giao lộ đủ thoáng để đọc được giao thông. Tăng mật độ bằng footprint và cách xếp cụm trước khi tăng số mesh.

Các block xây dựng đặt mục tiêu 3–7 khối nhà có thể phân biệt; park, sân công nghiệp và landmark được miễn chỉ tiêu này. Không lấy số khối làm lý do nhồi thêm các hộp giống nhau.

| Cụm | Bố cục | Chi tiết nhận diện |
|---|---|---|
| Nhà phố | 4–6 nhà sát nhau, lệch chiều cao | Cửa lặp theo tầng, ban công, mái hiên, lối vào |
| Cửa hàng | 3–5 storefront, nhà góc nổi bật | Biển hiệu, kính, awning, cửa dịch vụ |
| Chung cư | 2 khối chính và 1–3 khối phụ | Nhịp tầng, ban công, sân chung, thiết bị mái |
| Văn phòng | 3–4 khối cao thấp | Façade bands, sảnh, kính theo nhịp, parapet |
| Công nghiệp | Nhà xưởng, kho và khối phụ | Mái răng cưa hoặc mái lớn, cửa kho, bồn nước |
| Dịch vụ | Cửa hàng tiện lợi/trạm xăng và công trình cạnh bên | Canopy, pump, lối xe vào đọc được |
| Công viên | Mảng xanh nhỏ giữa phố | Đường đi, cây, ghế; không thành khoảng trống lớn |
| Landmark TrọƠi | Một cụm nhận diện ở vị trí khởi đầu | Biển TrọƠi, kiến trúc cùng ngôn ngữ với khu phố |

Ưu tiên building có sẵn trong KayKit khi silhouette phù hợp. Custom building chỉ thay thế khi có mặt đứng và mái đủ chi tiết. Không dùng PNG Suburban làm billboard. Chi tiết lặp dùng instancing hoặc merged geometry theo material; mỗi cửa sổ không cần một Mesh riêng.

## 4. Infinity: tuần hoàn liền mạch

Chọn periodic world để gần hành vi mong muốn và tận dụng composition đã bố trí. Đây là vô hạn về khả năng kéo, có lặp nội dung; không tuyên bố là thành phố mới vô hạn được sinh ngẫu nhiên.

Rebase chỉ đưa số tọa độ về gần origin, không tự tạo nội dung hay che rìa. Infinity cần cả một pool phủ viewport, nội dung nối nhau ở biên và cơ chế tái bố trí slot ngoài vùng thấy.

Một chu kỳ nội dung mặc định gồm 12×12 block. Độ dài chu kỳ không phụ thuộc kích thước pool. Pool bắt đầu 9×9 và chỉ được giữ nếu vượt kiểm tra frustum ở mọi viewport; có thể tăng theo bằng chứng đo và ngân sách rendering.

Mỗi slot giữ tọa độ cell thế giới nguyên và transform cục bộ. Nội dung lấy theo positiveModulo(cellX, 12), positiveModulo(cellZ, 12). Cùng tọa độ luôn chọn cùng cluster, rotation và palette. Landmark xuất hiện lại theo chu kỳ; không hứa là duy nhất trên toàn world.

Khi map vượt một block pitch, đổi hàng/cột phía ngoài viewport sang đầu bên kia. Dịch đồng thời origin và transform local để các đối tượng còn nhìn thấy giữ nguyên vị trí màn hình. Kéo chéo xử lý hợp của hàng/cột, góc chỉ cập nhật một lần. Delta nhiều block trong một frame phải được xử lý đầy đủ trước render, không dựa vào một lần if.

Pool được xác định từ giao của frustum với mặt đất, thêm biên cho nhà cao, bóng và chuyển động giữa hai frame. Chỉ recycle slot khi cả hình học và bóng liên quan đã ra ngoài vùng thấy. Không giảm chi tiết cố định theo nhãn core/overscan cũ: slot tiến vào viewport phải có chất lượng đầy đủ trước khi xuất hiện.

## 5. Ranh giới module

| Module | Trách nhiệm | Contract chính |
|---|---|---|
| CameraRig | Camera và chỗ nối animation tương lai | resize, lock/unlock input; pan không ghi transform camera |
| PanController | Pointer capture, ground-plane drag, damping | update(dt), setEnabled, dispose; xuất delta X/Z |
| InfiniteTown | Điều phối offset, cell origin và pool | panBy, update, dispose |
| WorldRebase | Chuẩn hóa origin và residual offset | Trả delta cell, residual; không sinh mesh |
| ClusterLibrary | Composition bất biến theo cell tuần hoàn | resolve(cell), bounds; không chứa trạng thái pointer |
| BlockPool | Gán cluster cho slot, tái sử dụng instance | Đồng bộ trước render; sở hữu instance, không sở hữu asset gốc |
| RoadPool | Đường và giao lộ liền mạch | Cùng pitch/origin với block; không nhân đôi giao lộ |
| VehicleSystem | Xe chạy liên tục qua biên | Route theo tọa độ world/chu kỳ, phase theo simulation time |
| RendererQuality | DPR, AA, texture, shadow và metrics | Áp cấu hình theo tier, không đổi bố cục |

Giữ hình dáng roads hiện tại; cho phép sửa ownership và transform để nối với infinity. Không khóa cứng yêu cầu “không sửa RoadNetwork” vì điều đó mâu thuẫn với thay đổi này.

## 6. Input và animation

Pointer-down trên vùng canvas bắt đầu drag sau ngưỡng 5 CSS px. Tính giao ray với mặt phẳng Y=0 để map đi cùng ngón tay; không map screen Y thành world Y. Pointer capture giữ drag khi ra khỏi canvas. Pointercancel, blur và mất capture phải kết thúc gesture sạch.

Thả tay có quán tính ngắn, giảm theo dt; giới hạn dt khi quay lại tab để tránh nhảy xa. reduced-motion tắt quán tính. Một ngón kéo map; pinch không zoom và không làm camera thay đổi. Vùng điều khiển HTML không truyền drag vào scene.

Để tránh khóa cuộn trang trên mobile, chỉ bật drag trong vùng tương tác hero được chỉ định; phần nội dung/CTA ngoài canvas vẫn cuộn bình thường. Cung cấp nút bật/tắt “Khám phá bản đồ” trên mobile nếu canvas chiếm toàn hero. Khi tắt, gesture thuộc trang; khi bật, gesture thuộc map. Mouse desktop kéo trực tiếp.

Animation tương lai gọi setEnabled(false), hủy gesture và velocity trước khi điều khiển CameraRig. Sau animation, cập nhật ground projection rồi mới mở input. Giai đoạn này chỉ thiết kế interface, không thêm animation chưa yêu cầu.

## 7. Xe và tài nguyên

Xe dùng phase từ simulation time và route world; recycle block không reset xe đang nhìn thấy. Road, vehicle, props và bóng đổi origin trong cùng frame. Không teleport xe giữa viewport.

Preload tập asset cần cho cluster trước khi mở tương tác. Cache geometry/material/texture một lần. Recycle không tải GLTF và không dispose tài nguyên dùng chung. Instance trả về pool; dispose toàn scene mới giải phóng tài nguyên sở hữu chung.

Thiếu asset tùy chọn dùng fallback cùng footprint. Thiếu road hoặc building nền tảng thì giữ poster/static fallback và hiển thị nút thử lại; không render một khu phố thủng lỗ. WebGL unavailable/context lost dùng fallback nhẹ, CTA vẫn hoạt động.

## 8. Độ nét và khử răng cưa

MSAA là cấu hình khởi tạo khi context hỗ trợ. Desktop khởi đầu DPR min(devicePixelRatio, 2); mobile min(devicePixelRatio, 1.5), chỉ nâng tối đa 1.75 khi frame time đủ tốt. Không ép DPR 2 trên mọi máy. Chỉ giảm DPR sau một khoảng đo ổn định, có hysteresis; không dao động chất lượng mỗi frame.

Texture anisotropy giới hạn theo phần cứng và preset. Kiểm tra mipmaps để mặt đường và mái không nhấp nháy khi kéo. Color space, tone mapping và exposure phải thống nhất giữa asset gốc/custom; chốt giá trị sau screenshot comparison.

Tune shadow bias/normal bias để tránh sọc và bóng rời chân nhà; bóng mềm vừa phải, không phủ đen mặt đứng. Không dùng bloom hoặc sharpening mạnh để giả chi tiết. Chỉ thêm SMAA khi kiểm tra chuyển động cho thấy MSAA/DPR chưa đạt; không mặc định thêm FXAA gây mềm ảnh.

## 9. Ngân sách và nghiệm thu

Giữ ngân sách trước đó: dưới 850 Mesh objects và dưới 1000 draw calls ở mỗi viewport, gồm shadow pass trong phép đo thống nhất. Ghi thêm triangles, texture/geometry counts và frame time; mesh count thấp không tự đảm bảo chạy mượt.

Mục tiêu trên thiết bị kiểm thử ghi rõ model/browser: desktop median frame time ≤16.7 ms, mobile ≤33.3 ms sau warm-up. Chưa có thiết bị thật thì ghi rõ giới hạn; emulation không chứng minh mobile GPU performance.

Kiểm thử ở 1440×900, 1920×1080 và 390×844, cả DPR 1 và preset thiết bị. Mỗi viewport cần ảnh đầu, sau kéo ngang/dọc/chéo, tại ranh giới recycle và sau khi quay lại origin. So sánh hình ảnh với reference để đánh giá density, silhouette, façade và rooftop; không chỉ xác nhận build thành công.

Điều kiện đạt:
- Camera transform không đổi qua mouse/touch drag; không zoom/orbit/Y movement.
- Không thấy rìa, hở đường, pop nhà hoặc nhảy xe khi qua biên và góc.
- Quay lại cell cũ trả đúng composition, palette và rotation.
- Kéo qua ít nhất 1000 cell trong test mô phỏng không tăng pool, texture hoặc geometry count sau warm-up.
- Test nhiều-block delta và tọa độ âm; đường modulo không bị sai phía âm.
- Landmark không chiếm toàn khung; nhà tiền cảnh có nhịp tầng/mặt tiền/mái, không còn tower hộp trơn.
- Độ nét kiểm tra cả ảnh tĩnh và khi kéo; không có shimmer nổi bật ở mái/cửa/road markings.
- Typecheck, build và test liên quan pass; báo số thực đo mới, không kế thừa báo cáo cũ.
- Không phá CTA, page scroll, loading và base URL deployment.

## 10. Thứ tự triển khai

1. Mở đúng checkout local, đọc AGENTS.md/spec/plan cũ, xác minh HEAD và chụp baseline.
2. Khảo sát source reference và asset provenance; chọn phần tái sử dụng thực tế. Chưa kết luận quyền source/model chỉ từ việc repo public.
3. Dựng một cụm phố mẫu hoàn chỉnh và chụp cùng camera để khóa chất lượng building trước khi nhân rộng.
4. Thêm PanController, world coordinates và pool tuần hoàn; kiểm chứng invariant camera/biên.
5. Kết nối roads, props, vehicles và resource lifecycle.
6. Phủ ClusterLibrary, tăng mật độ, tune renderer, đo performance và QA các viewport.

Không push/merge/deploy theo quyết định trước. Khi có checkout, đặt spec tại docs/superpowers/specs/2026-09-25-trooi-infinitown-redesign.md. Bản này thay các đề xuất mâu thuẫn về rebase-only, camera pan và deterministic non-repeating world trong trao đổi trước. Spec đã được người dùng duyệt ngày 25/09/2026. Bước tiếp theo là đối chiếu checkout thực tế, viết implementation plan và triển khai Native trên `feat/infinity-town`; không mở lại vòng xin duyệt spec.
