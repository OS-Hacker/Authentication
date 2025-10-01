import React from "react";

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center flex-col space-y-2">
      <h5 className="animate-spin">
        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent border-solid rounded-full inline-block"></span>
      </h5>
      <h5 className="text-gray-500">Loading...</h5>
    </div>
  );
};

export default Loading;
