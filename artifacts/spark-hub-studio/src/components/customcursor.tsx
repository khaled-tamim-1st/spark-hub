// src/components/CustomCursor.tsx
import { useEffect, useState } from 'react';

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // نمسك العناصر
        const outer = document.querySelector('.custom-cursor-outer') as HTMLElement;
        const inner = document.querySelector('.custom-cursor-inner') as HTMLElement;

        if (!outer || !inner) return;

        // متغيرات لتأثير الانزلاق
        let outerX = 0;
        let outerY = 0;
        let targetX = 0;
        let targetY = 0;

        // تحديث موقع العناصر مع الماوس
        const handleMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
            
            // الداخلية تتحرك فوراً
            inner.style.left = e.clientX + 'px';
            inner.style.top = e.clientY + 'px';
        };

        // تأثير الانزلاق للدائرة الخارجية
        const smoothFollow = () => {
            outerX += (targetX - outerX) * 0.12; // سرعة الانزلاق
            outerY += (targetY - outerY) * 0.12;
            
            outer.style.left = outerX + 'px';
            outer.style.top = outerY + 'px';
            
            requestAnimationFrame(smoothFollow);
        };

        // تأثير النقر (تكبير مؤقت)
        const handleMouseDown = () => {
            inner.style.transform = 'translate(-50%, -50%) scale(2.5)';
            outer.style.transform = 'translate(-50%, -50%) scale(1.4)';
            
            setTimeout(() => {
                inner.style.transform = 'translate(-50%, -50%) scale(1)';
                outer.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 200);
        };

        // تأثير عند الخروج من الصفحة
        const handleMouseLeave = () => {
            outer.style.opacity = '0';
            inner.style.opacity = '0';
        };

        const handleMouseEnter = () => {
            outer.style.opacity = '1';
            inner.style.opacity = '1';
        };

        // بدء التتبع
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // بدء حركة الانزلاق
        const animationId = requestAnimationFrame(smoothFollow);

        // تنظيف الأحداث
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // المكون دا مش بيعرض حاجة مرئية
    return null;
}