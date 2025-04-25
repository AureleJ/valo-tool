import React, {useCallback, useEffect, useRef, useState} from "react";

export default function InteractiveMap({imagePath, setImageCoord}) {
    const [position, setPosition] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({x: 0, y: 0});
    const [fullscreen, setFullscreen] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const containerRef = useRef(null);
    const imageRef = useRef(null);

    const resetView = useCallback(() => {
        setZoom(1);
        setOffset({x: 0, y: 0});
    }, []);

    const toggleFullscreen = useCallback(() => {
        setFullscreen(prev => !prev);
        resetView();
    }, [resetView]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (fullscreen && e.key === "Escape") {
                setFullscreen(false);
                resetView();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [fullscreen, resetView]);

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        const handleMouseLeave = () => setIsDragging(false);

        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current || !imageRef.current) return;

            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            const container = containerRef.current.getBoundingClientRect();
            const imageWidth = container.width * zoom;
            const imageHeight = container.height * zoom;
            const maxOffsetX = (imageWidth - container.width) / 2;
            const maxOffsetY = (imageHeight - container.height) / 2;

            const newOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, offset.x + deltaX));
            const newOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, offset.y + deltaY));

            setOffset({x: newOffsetX, y: newOffsetY});
            setDragStart({x: e.clientX, y: e.clientY});
        };

        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [isDragging, dragStart, zoom, offset]);

    const getPosition = useCallback((e) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setPosition({x, y});
        setImageCoord({x, y});
    }, [setImageCoord]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) - (rect.width / 2));
        const mouseY = ((e.clientY - rect.top) - (rect.height / 2));

        const newZoom = Math.max(1, Math.min(5, zoom - Math.sign(e.deltaY) * 0.2));
        const scaleFactor = newZoom / zoom;

        const newOffsetX = (offset.x - mouseX) * scaleFactor + mouseX;
        const newOffsetY = (offset.y - mouseY) * scaleFactor + mouseY;

        const imageWidth = rect.width * newZoom;
        const imageHeight = rect.height * newZoom;
        const maxOffsetX = (imageWidth - rect.width) / 2;
        const maxOffsetY = (imageHeight - rect.height) / 2;

        setOffset({
            x: Math.min(maxOffsetX, Math.max(-maxOffsetX, newOffsetX)),
            y: Math.min(maxOffsetY, Math.max(-maxOffsetY, newOffsetY))
        });
        setZoom(newZoom);
    }, [containerRef, zoom, offset]);

    const handleMouseDown = useCallback((e) => {
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({x: e.clientX, y: e.clientY});
        }
    }, []);

    const handleClick = useCallback((e) => {
        if (e.detail === 2) {
            getPosition(e);
        }
    }, [getPosition]);

    useEffect(() => {
        const updateAspectRatio = () => {
            if (containerRef.current) {
                const container = containerRef.current.getBoundingClientRect();
                setAspectRatio(container.width / container.height);
            }
        };

        updateAspectRatio();

        window.addEventListener("resize", updateAspectRatio);
        return () => {
            window.removeEventListener("resize", updateAspectRatio);
        };
    }, [fullscreen]);

    useEffect(() => {
        setIsImageLoading(true);
    }, [imagePath]);

    const handleImageLoad = () => {
        setIsImageLoading(false);
    };

    return (
        <div className="relative w-2/3">
            <div
                ref={containerRef}
                className={`rounded-lg overflow-hidden aspect-square cursor-crosshair flex justify-center items-center bg-gray-800 shadow-lg border border-gray-700 ${
                    fullscreen
                        ? "fixed top-0 left-0 transform h-screen w-screen z-50 backdrop-blur-sm bg-opacity-95"
                        : "relative w-full"
                }`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >

                <div className="absolute z-20 top-4 left-4 flex gap-2 flex-col">
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 text-white px-3 py-2 rounded-lg bg-gray-700 bg-opacity-80 hover:bg-opacity-100 transition-all shadow-md"
                    >
                        {fullscreen ? (
                            <p>
                                Fermer
                            </p>
                        ) : (
                            <p>
                                Plein écran
                            </p>
                        )}
                    </button>
                    <button
                        onClick={resetView}
                        className="flex items-center gap-2 text-white px-3 py-2 rounded-lg bg-gray-700 bg-opacity-80 hover:bg-opacity-100 transition-all shadow-md"
                    >
                        Réinitialiser
                    </button>
                </div>

                <div
                    ref={imageRef}
                    className="absolute select-none overflow-hidden aspect-square"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        width: aspectRatio > 1 ? "auto" : "100%",
                        height: aspectRatio > 1 ? "100%" : "auto",
                    }}
                >
                    {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    <img
                        src={imagePath}
                        alt="interactive-map"
                        className="h-full w-full select-none object-contain"
                        draggable="false"
                        onLoad={handleImageLoad}
                        style={{opacity: isImageLoading ? 0 : 1}}
                    />

                    {position && (
                        <div className="absolute pointer-events-none"
                             style={{
                                 left: `${position.x * 100}%`,
                                 top: `${position.y * 100}%`,
                                 transform: 'translate(-50%, -50%)'
                             }}>
                            <div className="relative rounded-full bg-emerald-500 shadow-lg"
                                 style={{
                                     width: `${Math.max(4, 10 / zoom)}px`,
                                     height: `${Math.max(4, 10 / zoom)}px`,
                                 }}
                            />
                        </div>
                    )}
                </div>

                <div
                    className="absolute bottom-4 right-4 bg-gray-700 bg-opacity-80 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-md">
                    <div className="font-mono">{zoom.toFixed(1)}x</div>
                </div>
            </div>
        </div>
    );
}