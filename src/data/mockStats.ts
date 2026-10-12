// Dữ liệu mẫu cho dashboard. Thay bằng API (Facebook Graph / backend) khi có.

export const WEEKS = ['20/7', '27/7', '3/8', '10/8', '17/8', '24/8', '31/8', '7/9', '14/9', '21/9', '28/9', '5/10'];

export const SERIES = {
  views: [4200, 4800, 5100, 6300, 6000, 7400, 8200, 8900, 9600, 10800, 11500, 12900],
  likes: [310, 350, 390, 470, 450, 560, 620, 690, 740, 830, 890, 980],
  shares: [48, 55, 61, 79, 72, 96, 110, 124, 133, 152, 168, 187],
  // Tổng người đăng ký tích lũy
  subscribers: [120, 141, 163, 196, 221, 262, 305, 352, 401, 458, 519, 586],
};

export type Post = {
  id: string;
  title: string;
  date: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
};

export const POSTS: Post[] = [
  { id: 'p1', title: 'Phòng trọ 25m² full nội thất, gần ĐH Bách Khoa', date: '03/10', views: 5230, likes: 412, shares: 96, comments: 58 },
  { id: 'p2', title: '5 mẹo chốt điện nước nhanh, không sai số', date: '29/09', views: 3860, likes: 305, shares: 121, comments: 34 },
  { id: 'p3', title: 'Khu trọ mới Thủ Đức: giá từ 2,8 triệu', date: '24/09', views: 3410, likes: 268, shares: 74, comments: 41 },
  { id: 'p4', title: 'Checklist nhận phòng cho người thuê lần đầu', date: '18/09', views: 2975, likes: 241, shares: 88, comments: 27 },
  { id: 'p5', title: 'Trọ Ơi ra mắt hóa đơn tự động', date: '10/09', views: 2490, likes: 197, shares: 52, comments: 19 },
  { id: 'p6', title: 'Câu chuyện chủ trọ: từ sổ tay sang app', date: '02/09', views: 1840, likes: 143, shares: 39, comments: 12 },
];

export type Subscriber = {
  name: string;
  email: string;
  role: 'Chủ trọ' | 'Người thuê';
  source: string;
  date: string;
};

export const SUBSCRIBERS: Subscriber[] = [
  { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'Người thuê', source: 'Facebook', date: '05/10' },
  { name: 'Trần Quốc Bảo', email: 'quocbao@example.com', role: 'Chủ trọ', source: 'Zalo', date: '05/10' },
  { name: 'Lê Thu Hà', email: 'thuha@example.com', role: 'Người thuê', source: 'Facebook', date: '04/10' },
  { name: 'Phạm Gia Huy', email: 'giahuy@example.com', role: 'Chủ trọ', source: 'Website', date: '03/10' },
  { name: 'Võ Ngọc Lan', email: 'ngoclan@example.com', role: 'Người thuê', source: 'Giới thiệu', date: '02/10' },
  { name: 'Đặng Khánh Linh', email: 'khanhlinh@example.com', role: 'Người thuê', source: 'Facebook', date: '01/10' },
];

// Nguồn người đăng ký (%)
export const SOURCES: [string, number][] = [
  ['Facebook', 48],
  ['Zalo', 27],
  ['Website', 15],
  ['Giới thiệu', 10],
];
