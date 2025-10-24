'use client'
import {StarIcon} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({product}) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    // calculate the average rating of the product
    const rating = Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length);

    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto'>
            <div
                className="bg-[#F5F5F5] h-40 w-40 sm:w-[250px] sm:h-[250px] rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                    width={500}
                    height={500}
                    src={product.images[0]}
                    alt={product.name || ""}
                    className="w-full h-full object-fill group-hover:scale-110 transition duration-500"
                />
            </div>

            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p className="line-clamp-2">{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5'
                                      fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}/>
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard