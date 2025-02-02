"use client"
import Card from '@/components/cards/card'
import React, { useState } from 'react'

function ReviewWidget() {
  const [productFeedToDisplay, setProductFeedToDisplay] = useState('localFeed')

  const handleWhichNewsFeedToShow = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (event.currentTarget.id == 'localFeed') {
      setProductFeedToDisplay('localFeed')
    } else {
      setProductFeedToDisplay('storeFeed')
    }
  }

  // Make all the card UI 
  // make some fake data in google firebase
  // On call of the components get the data for the product from firebase and then cache it. 

  return (
    <>
    <div className="m-auto w-4/5">
      <div className="bg-slate-100 h-7 rounded-full flex justify-between mb-4">
        <button onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleWhichNewsFeedToShow(event)} id="localFeed" className={`h-7 text-center w-1/2 text-black font-heading ${productFeedToDisplay == 'localFeed' ? 'bg-slate-600 rounded-full' : ''}`}>What&apos;s Going On With This Product?</button>
        <button onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleWhichNewsFeedToShow(event)} id="storeFeed" className={`h-7 text-center w-1/2 text-black font-heading ${productFeedToDisplay == 'storeFeed' ? 'bg-slate-600 rounded-full': ''}`}>All Product Feed</button>
      </div>
      <Card />

    </div>
    </>
  )
}

export default ReviewWidget