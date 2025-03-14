import eventImage from '../../assets/programmingImg.png'
import image1 from '../../assets/image1.jpg'
import image2 from '../../assets/image2.jpg'
import image3 from '../../assets/image3.jpg'

export const getDefaultImages = () => {
  const imageItems = [
    {
      img: eventImage,
      title: 'Event',
    },
    {
      img: image1,
      title: 'Technology',
    },
    {
      img: image2,
      title: 'Coding',
    },
    {
      img: image3,
      title: 'Virtual',
    },
  ]
  return imageItems
}
