import React from "react";
import Heading from "../Heading/Heading";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import customer1 from "../../assets/customer1.jpg";
import customer2 from "../../assets/customer2.jpg";
import customer3 from "../../assets/customer3.jpg";
import customer4 from "../../assets/customer4.jpg";
import customer5 from "../../assets/customer5.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaStar } from "react-icons/fa6";
const Testimonials = () => {
  return (
    <section>
      <div className="max-w-[1400px] mx-auto px-10 mb-5">
        <Heading highlight="Customer" heading="Saying" />
        <div className="flex justify-end mt-5 py-5 gap-x-3">
          <button
            className="custom-prev text-2xl text-zinc-800 rounded-lg w-11 h-11 flex justify-center items-center bg-zinc-100  
                hover:bg-gradient-to-b hover:from-orange-400 hover:to-orange-500 hover: text-white cursor-pointer"
          >
            <IoIosArrowBack />
          </button>
          <button
            className="custom-next text-2xl text-zinc-800 rounded-lg  w-11 h-11 flex justify-center items-center bg-zinc-100 
                hover:bg-gradient-to-b hover:from-orange-400 hover:to-orange-500 hover: text-white cursor-pointer"
          >
            <IoIosArrowForward />
          </button>
        </div>
        <Swiper
          loop={true}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          modules={[Navigation]}
          className="mySwiper"
        >
          {review.map((item) => (
            <SwiperSlide key={item.id} className="bg-zinc-100 p-8 rounded-xl">
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 rounded-full bg-red-500 outline-2 outline-orange-500 outline-offset-4 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h5 className="text-xl font-bold">{item.name}</h5>
                  <p className="text-zinc-600">{item.profession}</p>
                  <span className="flex text-yellow-400 mt-3 text-xl gap-1 ">
                    {Array.from({ length: item.rating }, (_, index) => (
                      <FaStar key={index} /> 
                    ))}
                  </span>
                </div>
              </div>
              <div className="mt-10 min-h-[15vh]">
                <p className="text-zinc-600">{item.para}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
const review = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    profession: "Reviewer công nghệ",
    rating: 5,
    para: "Shop này bán điện thoại cực uy tín. Mình đã mua iPhone 17 Pro Max và Samsung Galaxy S24 Ultra tại đây – cả hai đều nguyên seal, giao hàng nhanh, hỗ trợ nhiệt tình.",
    image: customer1,
  },
  {
    id: 2,
    name: "Trần Quốc Bảo",
    profession: "Nhiếp ảnh gia",
    rating: 5,
    para: "Camera của Xiaomi 14 Pro mình mua ở shop quá đỉnh, đúng như tư vấn. Máy chạy mượt, chụp ảnh sắc nét, giá lại rất hợp lý.",
    image: customer2,
  },
  {
    id: 3,
    name: "Lê Thảo Vy",
    profession: "Người mẫu",
    rating: 5,
    para: "Shop giao hàng siêu nhanh, đóng gói cẩn thận. Mình mua Oppo Find X7 và rất hài lòng với thiết kế sang trọng, pin trâu, hiệu năng mạnh.",
    image: customer3,
  },
  {
    id: 4,
    name: "Phạm Văn Hùng",
    profession: "HLV thể hình",
    rating: 5,
    para: "Mình cần điện thoại mạnh để quay video và chỉnh sửa. Shop tư vấn mình chọn Vivo X100 Pro – quay 4K cực nét, pin khỏe, giá tốt.",
    image: customer4,
  },
  {
    id: 5,
    name: "Hoàng Mai Linh",
    profession: "Chuyên gia dinh dưỡng",
    rating: 5,
    para: "Không chỉ bán điện thoại, shop còn tư vấn rất kỹ về cấu hình và nhu cầu sử dụng. Mình đã mua Realme GT5 và cực kỳ hài lòng với hiệu năng và dịch vụ.",
    image: customer5,
  },
];

