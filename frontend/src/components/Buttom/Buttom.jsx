import React from 'react'

const Buttom = (props) => {
  return (
    <button
      className="bg-gradient-to-b from-orange-400 
      to-orange-500 text-white px-8 py-3 rounded-lg md:text-lg text-md hover:scale-105 hover:to-orange-600 
      transition-all duration-300 cursor-pointer"
    >
      {props.content}
      {/* transition-all → áp dụng hiệu ứng chuyển động cho tất cả thuộc tính có thể thay đổi.
      duration-300 → thời gian chuyển động là 300ms (0.3 giây). */}
    </button>
  )
}

export default Buttom
