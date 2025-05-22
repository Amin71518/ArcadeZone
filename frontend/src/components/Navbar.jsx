import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './Navbar.css';

const links = [
{ label: 'Игры', path: '/games' },
{ label: 'Аккаунт', path: '/account' },
{ label: 'Вход', path: '/login' },
];

const Navbar = () => {
const location = useLocation();
const underlineRef = useRef(null);
const linkRefs = useRef([]);
const tl = useRef(null);

useEffect(() => {
const activeIndex = links.findIndex(link => link.path === location.pathname);
if (activeIndex === -1) return;
const activeEl = linkRefs.current[activeIndex];
if (!activeEl || !underlineRef.current) return;

const { offsetLeft: x, offsetWidth: width } = activeEl;

if (tl.current) tl.current.kill();

tl.current = gsap.timeline();
tl.current.to(underlineRef.current, {
  x,
  width,
  duration: 0.4,
  ease: 'power2.out'
});
}, [location.pathname]);
return (
<nav className="gsap-navbar">
<div className="gsap-nav-inner">
{links.map((link, idx) => (
<Link
key={link.path}
to={link.path}
className={`gsap-link${location.pathname === link.path ? ' active' : ''}`}
ref={el => (linkRefs.current[idx] = el)}
>
{link.label}
</Link>
))}
<div className="gsap-underline" ref={underlineRef} />
</div>
</nav>
);
};

export default Navbar;