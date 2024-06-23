'use client'
import styles from './nav.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '../../utils/auth'
import useAuth from '../../hooks/useAuth'
import { useState, useEffect } from 'react'

function Nav() {
    const { user } = useAuth()
    const router = useRouter()
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('open-menu')
        } else {
            document.body.classList.remove('open-menu')
        }

        return () => {
            document.body.classList.remove('open-menu')
        };
    }, [isMenuOpen])

    const handleLogout = async () => {
        await logout()
        router.push('/')
        setIsMenuOpen(false)
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const closeMenu = () => {
        setIsMenuOpen(false);
    }

    return (
        <>
            <div className={styles.hamburger + (isMenuOpen ? ` ${styles.open}` : '')} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={styles.nav}>
                <div className={styles.leftNav}>
                    <Link href="/" className={styles.title} onClick={closeMenu}>
                        Watered & Blogged
                    </Link>
                    <div>A blog for the love of plants</div>
                </div>

                {user && (
                    <div className={`${styles.rightNav} ${isMenuOpen ? styles.open : ''}`}>
                        <Link href="/" className={styles.link} onClick={closeMenu}>
                            Home
                        </Link>
                        <Link href="/profile" className={styles.link} onClick={closeMenu}>
                            Profile
                        </Link>
                        {user.email === adminEmail && (
                            <Link href="/admin" className={styles.link} onClick={closeMenu}>
                                Admin
                            </Link>
                        )}
                        <p onClick={handleLogout} className={styles.link}>
                            Logout
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Nav




