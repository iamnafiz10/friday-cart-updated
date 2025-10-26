'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import {useSelector} from 'react-redux'

const BestSelling = () => {
    const displayQuantity = 10
    const products = useSelector(state => state.product.list || [])

    // Filter only in-stock products
    const inStockProducts = products.filter(product => product.inStock)

    // Sort by rating length (most reviews first) and limit to displayQuantity
    const topProducts = inStockProducts
        .slice()
        .sort((a, b) => b.rating.length - a.rating.length)
        .slice(0, displayQuantity)

    return (
        <div className='px-6 mx-auto mt-20'>
            <div className="custom_title_class">
                <Title
                    title='Best Selling'
                    description={`Showing ${topProducts.length} of ${inStockProducts.length} products`}
                    href='/shop'
                />
            </div>
            {topProducts.length > 0 ? (
                <div className='mt-12 gap-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {topProducts.map((product, index) => (
                        <ProductCard key={product.id || index} product={product}/>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 mt-10">No products found.</p>
            )}
        </div>
    )
}

export default BestSelling