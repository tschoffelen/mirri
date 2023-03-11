import React, { useEffect, useRef, useState } from 'react';
import { Excalidraw, restore, restoreAppState, serializeAsJSON } from "@excalidraw/excalidraw";

import './style.scss';

const Draw = ({ id }) => {
    const excalidraw = useRef(null);
    const [editMode, setEditMode] = useState(!id);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`https://schof.link/${id}?k=${new Date()}`)
                .then(res => res.json())
                .then(data => {
                    data.appState.viewModeEnabled = true;
                    excalidraw.current.updateScene(restore(data))
                })
                .catch(() => {
                    alert('Drawing not found');
                    location.href = '/draw';
                });
        }
    }, [id]);

    const save = async () => {
        const data = serializeAsJSON(
            excalidraw.current.getSceneElements(),
            excalidraw.current.getAppState(),
            excalidraw.current.getFiles(),
            'database'
        );

        setLoading(true);
        const res = await fetch(`https://schof.link/api/get-url?${new URLSearchParams({
            filename: 'drawing.json',
            contentType: 'application/json',
            editable: 'true',
            id: id || undefined
        })}`);
        const { url, key } = await res.json();

        if (!id) {
            history.pushState({ key }, "", "/draw/" + key);
        }

        setEditMode(false);

        await fetch(url, {
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `inline; filename="drawing.json"`
            },
        });

        setLoading(false);
    }

    return (
        <div className="draw">
            <Excalidraw
                ref={(ref) => excalidraw.current = ref}
                autoFocus
                viewModeEnabled={!editMode}
                loading={loading}
                UIOptions={{
                    welcomeScreen: false,
                }}
                renderTopRightUI={() => editMode ? (
                    <button
                        className="save-button"
                        onClick={save}>
                        {loading ? 'Loading...' : (id ? 'Update' : 'Publish')}
                    </button>
                ) : (
                    <button className="edit-button" onClick={() => setEditMode(true)}>
                        {loading ? 'Loading...' : 'Edit'}
                    </button>
                )}
            />
        </div>
    );
}

export default Draw;
