'use client'

import Title from './Title'
import ProductCard from './ProductCard'
import {useSelector} from 'react-redux'

const LatestProducts = () => {
    const products = useSelector(state => state.product.list || [])

    // Filter only in-stock products
    const inStockProducts = products.filter(product => product.inStock)

    // Sort by createdAt (latest first)
    const latestProducts = inStockProducts
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return (
        <div className="px-6 mx-auto mt-10 sm:mt-0">
            <div className="custom_title_class">
                <Title
                    title="Latest Products"
                    description={`Showing ${latestProducts.length} product${latestProducts.length !== 1 ? 's' : ''}`}
                    href="/shop"
                />
            </div>

            {latestProducts.length > 0 ? (
                <div className="mt-12 gap-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {latestProducts.map((product, index) => (
                        <ProductCard key={product.id || index} product={product}/>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 mt-10">No products found.</p>
            )}
        </div>
    )
}

export default LatestProducts