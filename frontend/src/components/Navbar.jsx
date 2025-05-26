import React, { useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token } = useContext(AuthContext);

  const baseLinks = [
    { label: 'Игры', path: '/games' }
  ];

  const links = token
    ? [...baseLinks, { label: 'Аккаунт', path: '/account' }]
    : [...baseLinks, { label: 'Вход', path: '/login' }];

  const location = useLocation();
  const underlineRef = useRef(null);
  const linkRefs = useRef([]);
  const tl = useRef(null);

  useEffect(() => {
    // Находим индекс активной ссылки или берем последнюю, если не найдено
    const activeIndex = links.findIndex(link => location.pathname.startsWith(link.path));
    const underlineIndex = activeIndex === -1 ? links.length - 1 : activeIndex;
    const underline = underlineRef.current;
    const activeEl = linkRefs.current[underlineIndex];
    if (!activeEl || !underline) return;

    const { offsetLeft: x, offsetWidth: width } = activeEl;
    if (tl.current) tl.current.kill();

    tl.current = gsap.timeline();
    tl.current.to(underline, {
      x,
      width,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, [location.pathname, links]);

  return (
    <nav className="gsap-navbar">
      <div className="gsap-nav-inner">
        {links.map((link, idx) => (
          <Link
            key={link.path}
            to={link.path}
            className={`gsap-link${location.pathname.startsWith(link.path) ? ' active' : ''}`}
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
