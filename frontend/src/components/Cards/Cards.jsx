import React from "react";
import { FaHeart, FaPlus } from "react-icons/fa";
import Buttom from "../Buttom/Buttom";
import { Link } from "react-router-dom";
const Cards = ({image, name, price}) => {
  return (
    <div className="bg-zinc-100 p-5 rounded-xl ">
      <div className="flex justify-between ">
            <span className="text-3xl text-zinc-300">
            <FaHeart />
            </span>
            <button className="bg-gradient-to-b from-orange-400 to-orange-500 text-white text-xl p-4 py-3 rounded-lg">
            <FaPlus />
            </button>
      </div>
      <div className="w-full h-50 ">
            <img src={image} className="w-full h-full object-contain mx-auto " />
      </div>

      <div className="text-center">
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="text-2xl font-bold mt-4 mb-3">${price.toFixed(2)} </p>
            <Link
            to="/detail"
            className="bg-gradient-to-b from-orange-400 
              to-orange-500 text-white px-8 py-3 rounded-lg md:text-lg text-md hover:scale-105 hover:to-orange-600 
            transition-all duration-300 cursor-pointer"
          >
            Show Now
          </Link>
      </div>

    </div>
  );
};

export default Cards;
