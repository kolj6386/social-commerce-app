import { Chat, FavoriteBorderOutlined, MoreVert, Visibility } from '@mui/icons-material'
import Image from 'next/image'
import React from 'react'


// type Props = {}
// props: Props
// Need to make a color object somewhere that has the list of colors to use. 
// Need to create a scrollable carousel as well on the images. 

const Card = () => {
  return (
    <div className="w-1/2 bg-[#dfecff] rounded-2xl">
      <div className="p-4">

        <div className="flex">
          <div className="flex w-full justify-between">
            <div className="flex">
              <div className="">
                <Image 
                  src="https://avatar.iran.liara.run/public"
                  alt="Avatar"
                  width={50}
                  height={50}
                />
              </div>
              <div className="ml-4">
                <p className="text-black font-semibold">George Lobko</p>
                <span className="text-[#acb8ce] font-normal">2 hours ago</span>
              </div>
            </div>

            <div className="rounded-full p-2 border-[#acb8ce] border-2">
              <MoreVert sx={{ color: '#000000', fontSize: 30  }} />
            </div>

          </div>
        </div>

        <div className="text-black mt-2 font-body font-medium">
          Hey everyone, today I was on the most beautiful mountain in the world, I also want to say hi to Shopify!
        </div>

        <div className="flex mt-1">
        <Image 
          src="/image1.jpg"
          alt="Avatar"
          width={200}
          height={400}
          className='rounded-2xl object-contain mr-2'
        />
        <Image 
          src="/image2.jpg"
          alt="Avatar"
          width={200}
          height={400}
          className='rounded-2xl object-contain'
        />
        </div>


        <div className="flex justify-between items-end mt-2">
          <div className="">
            <Visibility sx={{ color: '#acb8ce', fontSize: 30  }} />
            <FavoriteBorderOutlined sx={{ color: '#acb8ce', fontSize: 30  }} className='ml-4'  />
            <Chat sx={{ color: '#acb8ce', fontSize: 30  }} className='ml-4' />
          </div>
          <div className="">
          <button className="px-4 py-1.5 font-heading font-medium bg-[#acb8ce] text-white rounded-full hover:bg-gray-400 transition">
            Set Reaction
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card