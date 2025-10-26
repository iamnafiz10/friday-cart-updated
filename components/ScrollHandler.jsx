'use client'
import {useEffect} from 'react'

export default function ScrollHandler() {
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual'
        }

        // Restore scroll position on page load
        const savedScroll = sessionStorage.getItem('scroll-position')
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10))
        }

        const handleScroll = () => {
            sessionStorage.setItem('scroll-position', window.scrollY)
        }

        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return null
}