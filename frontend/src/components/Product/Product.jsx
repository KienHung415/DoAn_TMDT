import React, { useState } from "react";
import Heading from "../Heading/Heading";
import ProductList from "../ProductList/ProductList";
import Buttom from "../Buttom/Buttom";

import Cards from "../Cards/Cards";
const Product = () => {
  const categories = ["All", "Fruit", "Vegetables", "Dairy", "SeaFood"];
  const [activeTab, setActiveTab] = useState("All");

  let filteredItems = activeTab === "All"
    ? ProductList : ProductList.filter(item => item.category === activeTab);

  const renderCards = filteredItems.slice(0, 8).map((product) => {
    return <Cards key={product.id} image={product.image} name={product.name} price={product.price} />;
  });
  return (
    <section>
      <div className="max-w-[1400px] mx-auto px-10">
        <Heading highlight="Our" heading="Products" />

        <div className="flex gap-3 justify-center mt-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`rounded-lg px-5 text-lg cursor-pointer 
            ${activeTab === category
                  ? "bg-linear-to-b from-orange-400 to-orange-500 text-white"
                  : "bg-zinc-100"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-9 mt-20">
          {renderCards}

        </div>

        <div className="mt-15 mx-auto w-fit">
          <Buttom content="View All" />
        </div>
      </div>
    </section>
  );
};

export default Product;
