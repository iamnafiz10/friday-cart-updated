'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import {useSelector} from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 10
    const products = useSelector(state => state.product.list)

    return (
        <div className='px-6 mx-auto mt-20'>
            <div className="custom_title_class">
                <Title title='Best Selling'
                       description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`}
                       href='/shop'/>
            </div>
            <div className='mt-12 gap-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {products.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product}/>
                ))}
            </div>
        </div>
    )
}

export default BestSelling