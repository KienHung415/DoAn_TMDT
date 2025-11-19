import React from "react";
import Grocery from "../../assets/grocery.png";
import Buttom from "../Buttom/Buttom.jsx";
import anh from "../../assets/2.jpeg";
const Hero = () => {
  return (
    <section>
      <div className=" min-h-screen max-w-[1500px] mx-auto px-10 flex md:flex-row flex-col items-center justify-between md:pt-25 pt-35">
        {/* Left content */}
        <div className="flex-1 ">
          <span className="bg-orange-100 text-orange-500 text-lg px-5 py-2 rounded-full ">
            Trải nghiệm đỉnh cao...
          </span>
          <h1 className="md:text-7xl/20 text-5xl/14 font-bold mt-4">
            Khám phá <span className="text-orange-500">iPhone 17 Pro Max</span>{" "}
            –<span className="text-orange-500">Sức mạnh</span> & Thiết kế tương
            lai
          </h1>
          <p className="md:text-lg text-md text-zinc-600 max-w-[600px] mt-5 mb-7">
            Camera đột phá, hiệu năng vượt trội, và trải nghiệm chưa từng có – tất cả trong một siêu phẩm.
          </p>
          <Buttom content="Mua ngay" />
        </div>

        {/* Right image */}
        <div className="flex-1">
          <img src={anh} alt="Hero Image" className="w-[1000px] h-[500px]" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
