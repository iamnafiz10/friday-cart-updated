'use client';

import {addToCart} from "@/lib/features/cart/cartSlice";
import {StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import Image from "next/image";
import {useDispatch, useSelector} from "react-redux";
import Counter from "./Counter";

const ProductDetails = ({product}) => {
    const dispatch = useDispatch();
    const router = useRouter();

    const cart = useSelector(state => state.cart.cartItems || {});
    const quantity = cart[product.id] || 0;

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = () => {
        dispatch(addToCart({productId: product.id}));
    };

    const averageRating =
        product.rating && product.rating.length > 0
            ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
            : 0;

    return (
        <div className="flex max-lg:flex-col gap-12">
            {/* Images */}
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(image)}
                            className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer"
                        >
                            <Image
                                src={image}
                                className="group-hover:scale-103 group-active:scale-95 transition"
                                alt={product.name || 'Product Image'}
                                width={45}
                                height={45}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg">
                    <Image src={mainImage} alt={product.name || ''} width={250} height={250}/>
                </div>
            </div>

            {/* Details */}
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>

                {/* Rating */}
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon
                            key={index}
                            size={14}
                            className='text-transparent mt-0.5'
                            fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
                        />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} Reviews</p>
                </div>

                {/* Price */}
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p>{currency}{product.price}</p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>

                {/* Discount */}
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14}/>
                    <p>Save {product.mrp ? (((product.mrp - product.price) / product.mrp) * 100).toFixed(0) : 0}% right
                        now</p>
                </div>

                {/* Add to Cart / Counter */}
                <div className="flex items-end gap-5 mt-10">
                    {quantity > 0 && <Counter productId={product.id}/>}
                    <button
                        onClick={() => quantity === 0 ? addToCartHandler() : router.push('/cart')}
                        className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition"
                    >
                        {quantity === 0 ? 'Add to Cart' : 'View Cart'}
                    </button>
                </div>

                {/* Shipping & Security */}
                <hr className="border-gray-300 my-5"/>
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"><EarthIcon className="text-slate-400"/> Free shipping worldwide</p>
                    <p className="flex gap-3"><CreditCardIcon className="text-slate-400"/> 100% Secured Payment</p>
                    <p className="flex gap-3"><UserIcon className="text-slate-400"/> Trusted by top brands</p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails;