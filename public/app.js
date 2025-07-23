// 簡易的なLucideアイコンコンポーネント
const Icon = ({ name, className = "" }) => {
    const icons = {
        dumbbell: "M6.5 6.5L17.5 17.5M6.5 6.5L3 3M6.5 6.5L3 10M17.5 17.5L21 21M17.5 17.5L21 14M3 10V14L7 18L10 21H14L18 17L21 14V10L17 7L14 3H10L7 6L3 10Z",
        plus: "M12 5v14m-7-7h14",
        heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        "message-circle": "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
        wifi: "M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
        "wifi-off": "M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01M5 12.55a11 11 0 0 1 14.08 0M1 1l22 22",
        trash: "M3 6h18m-2 0v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
        edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.5-6.5a2.12 2.12 0 0 0-3-3L7 13v3h3l8.5-8.5z",
        check: "M20 6L9 17l-5-5",
        x: "M18 6L6 18M6 6l12 12",
        "plus-circle": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
        "minus-circle": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z",
        "log-out": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9",
        camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
        user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        "bar-chart": "M12 20V10M18 20V4M6 20v-6",
        calendar: "M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM8 2v4M16 2v4M3 10h18",
        trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M9 12l2 2 4-4",
        "chevron-down": "M6 9l6 6 6-6",
        "chevron-up": "M18 15l-6-6-6 6",
        image: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm12 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 8.5L6 8l4 4 2-2 3 3z"
    };
    
    return React.createElement('svg', {
        className: `lucide-icon ${className}`,
        xmlns: "http://www.w3.org/2000/svg",
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
    }, React.createElement('path', { d: icons[name] || "" }));
};

// アイコンコンポーネント
const Dumbbell = (props) => React.createElement(Icon, { name: "dumbbell", ...props });
const Plus = (props) => React.createElement(Icon, { name: "plus", ...props });
const Heart = (props) => React.createElement(Icon, { name: "heart", ...props });
const MessageCircle = (props) => React.createElement(Icon, { name: "message-circle", ...props });
const Wifi = (props) => React.createElement(Icon, { name: "wifi", ...props });
const WifiOff = (props) => React.createElement(Icon, { name: "wifi-off", ...props });
const Trash = (props) => React.createElement(Icon, { name: "trash", ...props });
const Edit = (props) => React.createElement(Icon, { name: "edit", ...props });
const Check = (props) => React.createElement(Icon, { name: "check", ...props });
const X = (props) => React.createElement(Icon, { name: "x", ...props });
const PlusCircle = (props) => React.createElement(Icon, { name: "plus-circle", ...props });
const MinusCircle = (props) => React.createElement(Icon, { name: "minus-circle", ...props });
const LogOut = (props) => React.createElement(Icon, { name: "log-out", ...props });
const Camera = (props) => React.createElement(Icon, { name: "camera", ...props });
const User = (props) => React.createElement(Icon, { name: "user", ...props });
const Home = (props) => React.createElement(Icon, { name: "home", ...props });
const BarChart = (props) => React.createElement(Icon, { name: "bar-chart", ...props });
const Calendar = (props) => React.createElement(Icon, { name: "calendar", ...props });
const Trophy = (props) => React.createElement(Icon, { name: "trophy", ...props });
const ChevronDown = (props) => React.createElement(Icon, { name: "chevron-down", ...props });
const ChevronUp = (props) => React.createElement(Icon, { name: "chevron-up", ...props });
const Image = (props) => React.createElement(Icon, { name: "image", ...props });

// 画像モーダルコンポーネント
const ImageModal = ({ imageUrl, onClose }) => {
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return React.createElement('div', {
        className: "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4",
        onClick: onClose
    },
        React.createElement('div', {
            className: "relative max-w-full max-h-full",
            onClick: (e) => e.stopPropagation()
        },
            React.createElement('button', {
                onClick: onClose,
                className: "absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
            }, React.createElement(X, { className: "h-6 w-6" })),
            React.createElement('img', {
                src: imageUrl,
                alt: "トレーニング写真",
                className: "max-w-full max-h-[90vh] object-contain"
            })
        )
    );
};

// メインのReactコンポーネント
const FitShareApp = () => {
    const [posts, setPosts] = React.useState([]);
    const [socket, setSocket] = React.useState(null);
    const [connected, setConnected] = React.useState(false);
    const [showForm, setShowForm] = React.useState(false);
    const [showAuthForm, setShowAuthForm] = React.useState(false);
    const [isLogin, setIsLogin] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentView, setCurrentView] = React.useState('home'); // 'home', 'profile', 'stats'
    const [authToken, setAuthToken] = React.useState(() => {
        return localStorage.getItem('fitShareToken') || '';
    });
    const [currentUser, setCurrentUser] = React.useState(() => {
        const user = localStorage.getItem('fitShareUser');
        return user ? JSON.parse(user) : null;
    });
    const [editingPost, setEditingPost] = React.useState(null);
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [modalImage, setModalImage] = React.useState(null);
    
    // 認証フォーム
    const [authData, setAuthData] = React.useState({
        email: '',
        password: '',
        username: ''
    });
    
    // 複数種目対応の新しいフォームデータ構造
    const [formData, setFormData] = React.useState({
        exercises: [{
            exercise: '',
            sets: [{ weight: '', reps: '' }]
        }],
        comment: '',
        workoutDate: new Date().toISOString().split('T')[0]
    });

    // サーバーURLは現在のホストを使用
    const SERVER_URL = window.location.origin;

    // APIリクエストのヘッダー
    const getHeaders = () => {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        return headers;
    };

    // 自動ログインチェック
    React.useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('fitShareToken');
            const userStr = localStorage.getItem('fitShareUser');
            
            if (token && userStr) {
                try {
                    const response = await fetch(`${SERVER_URL}/api/posts`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        setAuthToken(token);
                        setCurrentUser(JSON.parse(userStr));
                    } else {
                        localStorage.removeItem('fitShareToken');
                        localStorage.removeItem('fitShareUser');
                    }
                } catch (error) {
                    console.error('認証チェックエラー:', error);
                }
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    React.useEffect(() => {
        // Socket.io接続
        const newSocket = io(SERVER_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('サーバーに接続しました');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('サーバーから切断されました');
            setConnected(false);
        });

        // 全投稿を受信
        newSocket.on('allPosts', (allPosts) => {
            setPosts(allPosts);
        });

        // 新規投稿を受信
        newSocket.on('newPost', (newPost) => {
            setPosts(prev => [newPost, ...prev]);
        });

        // 投稿の更新を受信
        newSocket.on('updatePost', (updatedPost) => {
            setPosts(prev => prev.map(post => 
                (post._id || post.id) === (updatedPost._id || updatedPost.id) ? updatedPost : post
            ));
        });

        // 投稿の削除を受信
        newSocket.on('deletePost', (postId) => {
            setPosts(prev => prev.filter(post => (post._id || post.id) !== postId));
        });

        // 初期データ取得
        fetch(`${SERVER_URL}/api/posts`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error('投稿の取得に失敗しました:', err));

        return () => {
            newSocket.close();
        };
    }, []);

    // デフォルトの種目リスト
    const defaultExercises = [
        'ベンチプレス',
        'スクワット',
        'デッドリフト',
        'ショルダープレス',
        'ラットプルダウン',
        'バーベルカール',
        'レッグプレス',
        'チェストフライ',
        'プルアップ',
        'ディップス',
        'ダンベルフライ',
        'レッグカール',
        'カーフレイズ',
        'アームカール',
        'トライセプスエクステンション'
    ];

    // ユーザーが追加した種目を含む完全なリスト
    const [exercises, setExercises] = React.useState(() => {
        const savedExercises = localStorage.getItem('fitShareCustomExercises');
        if (savedExercises) {
            const customList = JSON.parse(savedExercises);
            return [...new Set([...defaultExercises, ...customList])].sort();
        }
        return defaultExercises;
    });

    // カスタム種目入力の表示状態
    const [showCustomInput, setShowCustomInput] = React.useState(
        formData.exercises.map(() => false)
    );

    // 統計データ計算
    const getStatsData = () => {
        if (!currentUser || !posts.length) return null;

        const userPosts = posts.filter(post => {
            const postUser = post.userId || post.user;
            return postUser && (
                (typeof postUser === 'object' && postUser._id === currentUser.id) ||
                (typeof postUser === 'string' && postUser === currentUser.username)
            );
        });

        // 最大重量を計算
        const maxWeights = {};
        userPosts.forEach(post => {
            if (post.sets && Array.isArray(post.sets)) {
                post.sets.forEach(set => {
                    const weight = parseFloat(set.weight);
                    if (weight && (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])) {
                        maxWeights[post.exercise] = weight;
                    }
                });
            } else if (post.weight) {
                const weight = parseFloat(post.weight);
                if (weight && (!maxWeights[post.exercise] || weight > maxWeights[post.exercise])) {
                    maxWeights[post.exercise] = weight;
                }
            }
        });

        // 総トレーニング日数
        const uniqueDays = new Set(userPosts.map(post => 
            new Date(post.timestamp).toDateString()
        )).size;

        // 総投稿数
        const totalPosts = userPosts.length;

        // 最もよく行う種目
        const exerciseCount = {};
        userPosts.forEach(post => {
            exerciseCount[post.exercise] = (exerciseCount[post.exercise] || 0) + 1;
        });
        const mostFrequentExercise = Object.entries(exerciseCount)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            maxWeights,
            totalDays: uniqueDays,
            totalPosts,
            mostFrequentExercise: mostFrequentExercise ? mostFrequentExercise[0] : null,
            mostFrequentCount: mostFrequentExercise ? mostFrequentExercise[1] : 0
        };
    };

    // ログイン処理
    const handleLogin = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: authData.email,
                    password: authData.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAuthToken(data.token);
                setCurrentUser(data.user);
                localStorage.setItem('fitShareToken', data.token);
                localStorage.setItem('fitShareUser', JSON.stringify(data.user));
                setShowAuthForm(false);
                setAuthData({ email: '', password: '', username: '' });
            } else {
                const error = await response.json();
                alert(error.error || 'ログインに失敗しました');
            }
        } catch (error) {
            alert('ログインに失敗しました');
        }
    };

    // 新規登録処理
    const handleRegister = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData)
            });

            if (response.ok) {
                const data = await response.json();
                setAuthToken(data.token);
                setCurrentUser(data.user);
                localStorage.setItem('fitShareToken', data.token);
                localStorage.setItem('fitShareUser', JSON.stringify(data.user));
                setShowAuthForm(false);
                setAuthData({ email: '', password: '', username: '' });
            } else {
                const error = await response.json();
                alert(error.error || '登録に失敗しました');
            }
        } catch (error) {
            alert('登録に失敗しました');
        }
    };

    // ログアウト
    const handleLogout = () => {
        setAuthToken('');
        setCurrentUser(null);
        localStorage.removeItem('fitShareToken');
        localStorage.removeItem('fitShareUser');
        setCurrentView('home');
    };

    // 種目を追加
    const addExercise = () => {
        setFormData({
            ...formData,
            exercises: [...formData.exercises, {
                exercise: '',
                sets: [{ weight: '', reps: '' }]
            }]
        });
        setShowCustomInput([...showCustomInput, false]);
    };

    // 種目を削除
    const removeExercise = (index) => {
        if (formData.exercises.length > 1) {
            setFormData({
                ...formData,
                exercises: formData.exercises.filter((_, i) => i !== index)
            });
            setShowCustomInput(showCustomInput.filter((_, i) => i !== index));
        }
    };

    // 種目名を更新（カスタム種目対応）
    const updateExercise = (index, value) => {
        const newExercises = [...formData.exercises];
        if (value === 'その他（自由入力）') {
            const newShowCustom = [...showCustomInput];
            newShowCustom[index] = true;
            setShowCustomInput(newShowCustom);
            newExercises[index].exercise = '';
        } else {
            const newShowCustom = [...showCustomInput];
            newShowCustom[index] = false;
            setShowCustomInput(newShowCustom);
            newExercises[index].exercise = value;
        }
        setFormData({ ...formData, exercises: newExercises });
    };

    // カスタム種目を保存
    const saveCustomExercise = (exerciseName) => {
        if (exerciseName && !exercises.includes(exerciseName)) {
            const newExercises = [...exercises, exerciseName].sort();
            setExercises(newExercises);
            
            // ローカルストレージに保存
            const customExercises = newExercises.filter(ex => !defaultExercises.includes(ex));
            localStorage.setItem('fitShareCustomExercises', JSON.stringify(customExercises));
        }
    };

    // セットを追加
    const addSet = (exerciseIndex) => {
        const newExercises = [...formData.exercises];
        newExercises[exerciseIndex].sets.push({ weight: '', reps: '' });
        setFormData({ ...formData, exercises: newExercises });
    };

    // セットを削除
    const removeSet = (exerciseIndex, setIndex) => {
        const newExercises = [...formData.exercises];
        if (newExercises[exerciseIndex].sets.length > 1) {
            newExercises[exerciseIndex].sets.splice(setIndex, 1);
            setFormData({ ...formData, exercises: newExercises });
        }
    };

    // セットの値を更新
    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const newExercises = [...formData.exercises];
        newExercises[exerciseIndex].sets[setIndex][field] = value;
        setFormData({ ...formData, exercises: newExercises });
    };

    // 前のセットの重量をコピー
    const copyPreviousWeight = (exerciseIndex, setIndex) => {
        if (setIndex > 0) {
            const previousWeight = formData.exercises[exerciseIndex].sets[setIndex - 1].weight;
            updateSet(exerciseIndex, setIndex, 'weight', previousWeight);
        }
    };

    // 画像選択
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 5 * 1024 * 1024) {
            setSelectedImage(file);
        } else {
            alert('画像は5MB以下にしてください');
        }
    };

    // 投稿送信（複数種目対応）
    const handleSubmit = async () => {
        if (!currentUser) {
            setShowAuthForm(true);
            return;
        }

                // 各種目に対して個別に投稿を作成
        let hasValidExercise = false;
        for (const exerciseData of formData.exercises) {
            const hasValidSet = exerciseData.sets.some(set => set.weight && set.reps);
            
            if (exerciseData.exercise && hasValidSet) {
                hasValidExercise = true;
                const validSets = exerciseData.sets.filter(set => set.weight && set.reps);
                
                // カスタム種目を保存
                saveCustomExercise(exerciseData.exercise);
                
                const submitData = new FormData();
                submitData.append('exercise', exerciseData.exercise);
                submitData.append('sets', JSON.stringify(validSets));
                submitData.append('comment', formData.comment);
                submitData.append('workoutDate', formData.workoutDate);
                
                // 最初の種目にのみ画像を添付
                if (selectedImage && formData.exercises.indexOf(exerciseData) === 0) {
                    submitData.append('image', selectedImage);
                }

                try {
                    const response = await fetch(`${SERVER_URL}/api/posts`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: submitData
                    });

                    if (!response.ok) {
                        alert(`${exerciseData.exercise}の投稿に失敗しました`);
                        return;
                    }
                } catch (error) {
                    console.error('投稿の送信に失敗しました:', error);
                    alert('投稿の送信に失敗しました。もう一度お試しください。');
                    return;
                }
            }
        }

        if (!hasValidExercise) {
            alert('少なくとも1つの種目と有効なセットを入力してください');
            return;
        }

        // フォームをリセット
        setFormData({ 
            exercises: [{
                exercise: '',
                sets: [{ weight: '', reps: '' }]
            }],
            comment: '',
            workoutDate: new Date().toISOString().split('T')[0]
        });
        setSelectedImage(null);
        setShowCustomInput([false]);
        setShowForm(false);
    };

    // 投稿編集（既存の単一種目の投稿編集）
    const handleEdit = (post) => {
        setEditingPost(post);
        setFormData({
            exercises: [{
                exercise: post.exercise,
                sets: post.sets || [{ weight: post.weight || '', reps: post.reps || '' }]
            }],
            comment: post.comment || '',
            workoutDate: post.workoutDate ? 
                new Date(post.workoutDate).toISOString().split('T')[0] : 
                new Date(post.timestamp).toISOString().split('T')[0]
        });
        setShowCustomInput([false]);
        setShowForm(true);
    };

    // 投稿更新
    const handleUpdate = async () => {
        const exerciseData = formData.exercises[0];
        const hasValidSet = exerciseData.sets.some(set => set.weight && set.reps);
        
        if (exerciseData.exercise && hasValidSet) {
            const validSets = exerciseData.sets.filter(set => set.weight && set.reps);
            
            try {
                const response = await fetch(`${SERVER_URL}/api/posts/${editingPost._id || editingPost.id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        exercise: exerciseData.exercise,
                        sets: validSets,
                        comment: formData.comment,
                        workoutDate: formData.workoutDate
                    })
                });

                if (response.ok) {
                    setFormData({ 
                        exercises: [{
                            exercise: '',
                            sets: [{ weight: '', reps: '' }]
                        }],
                        comment: '',
                        workoutDate: new Date().toISOString().split('T')[0]
                    });
                    setEditingPost(null);
                    setShowForm(false);
                    setShowCustomInput([false]);
                }
            } catch (error) {
                alert('更新に失敗しました');
            }
        }
    };

    // 投稿削除
    const handleDelete = async (postId) => {
        if (confirm('本当にこの投稿を削除しますか？')) {
            try {
                const response = await fetch(`${SERVER_URL}/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });

                if (!response.ok) {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                alert('削除に失敗しました');
            }
        }
    };

    // いいね
    const handleLike = async (postId) => {
        if (!currentUser) {
            setShowAuthForm(true);
            return;
        }

        try {
            await fetch(`${SERVER_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: getHeaders()
            });
        } catch (error) {
            console.error('いいねの送信に失敗しました:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'たった今';
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;
        return date.toLocaleDateString('ja-JP');
    };

    // コメントを改行対応で表示するコンポーネント
    const CommentWithLineBreaks = ({ comment }) => {
        const lines = comment.split('\n');
        return React.createElement('div', { className: "text-gray-700 text-sm mb-2" },
            lines.map((line, index) => 
                React.createElement(React.Fragment, { key: index },
                    line,
                    index < lines.length - 1 && React.createElement('br')
                )
            )
        );
    };

    // プロフィールページコンポーネント
    const ProfilePage = () => {
        if (!currentUser) {
            return React.createElement('div', { className: "text-center py-8" },
                React.createElement('p', { className: "text-gray-600 mb-4" }, "プロフィールを見るにはログインしてください"),
                React.createElement('button', {
                    onClick: () => setShowAuthForm(true),
                    className: "bg-blue-600 text-white px-6 py-2 rounded-lg"
                }, "ログイン")
            );
        }

        const userPosts = posts.filter(post => {
            const postUser = post.userId || post.user;
            return postUser && (
                (typeof postUser === 'object' && postUser._id === currentUser.id) ||
                (typeof postUser === 'string' && postUser === currentUser.username)
            );
        });

        const statsData = getStatsData();

        return React.createElement('div', { className: "space-y-6" },
            // プロフィールヘッダー
            React.createElement('div', { className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6" },
                React.createElement('div', { className: "flex items-center space-x-4" },
                    React.createElement('div', { className: "w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold" },
                        currentUser.avatar
                    ),
                    React.createElement('div', {},
                        React.createElement('h2', { className: "text-xl font-bold" }, currentUser.username),
                        React.createElement('p', { className: "text-blue-100" }, currentUser.email),
                        React.createElement('p', { className: "text-sm text-blue-200 mt-1" }, 
                            `登録日: ${new Date().toLocaleDateString('ja-JP')}`
                        )
                    )
                )
            ),

            // 統計情報
            statsData && React.createElement('div', { className: "bg-white rounded-xl shadow-md p-6" },
                React.createElement('h3', { className: "text-lg font-bold mb-4 flex items-center" },
                    React.createElement(BarChart, { className: "h-5 w-5 mr-2 text-blue-600" }),
                    "トレーニング統計"
                ),
                React.createElement('div', { className: "grid grid-cols-2 gap-4 mb-4" },
                    React.createElement('div', { className: "bg-blue-50 rounded-lg p-4 text-center" },
                        React.createElement('div', { className: "text-2xl font-bold text-blue-600" }, statsData.totalDays),
                        React.createElement('div', { className: "text-sm text-gray-600" }, "トレーニング日数")
                    ),
                    React.createElement('div', { className: "bg-green-50 rounded-lg p-4 text-center" },
                        React.createElement('div', { className: "text-2xl font-bold text-green-600" }, statsData.totalPosts),
                        React.createElement('div', { className: "text-sm text-gray-600" }, "総投稿数")
                    )
                ),
                statsData.mostFrequentExercise && React.createElement('div', { className: "bg-yellow-50 rounded-lg p-4 mb-4" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                        React.createElement('span', { className: "font-medium" }, "最も多い種目"),
                        React.createElement('div', { className: "text-right" },
                            React.createElement('div', { className: "font-bold text-yellow-600" }, statsData.mostFrequentExercise),
                            React.createElement('div', { className: "text-sm text-gray-600" }, `${statsData.mostFrequentCount}回`)
                        )
                    )
                )
            ),

            // 最大重量記録
            statsData && Object.keys(statsData.maxWeights).length > 0 && React.createElement('div', { className: "bg-white rounded-xl shadow-md p-6" },
                React.createElement('h3', { className: "text-lg font-bold mb-4 flex items-center" },
                    React.createElement(Trophy, { className: "h-5 w-5 mr-2 text-yellow-500" }),
                    "最大重量記録"
                ),
                React.createElement('div', { className: "space-y-3" },
                    Object.entries(statsData.maxWeights)
                        .sort(([, a], [, b]) => b - a)
                        .map(([exercise, weight]) => 
                            React.createElement('div', { key: exercise, className: "flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3" },
                                React.createElement('span', { className: "font-medium" }, exercise),
                                React.createElement('div', { className: "flex items-center space-x-2" },
                                    React.createElement('span', { className: "text-xl font-bold text-orange-600" }, weight),
                                    React.createElement('span', { className: "text-sm text-gray-600" }, "kg")
                                )
                            )
                        )
                )
            ),

            // 最近の投稿
            React.createElement('div', { className: "bg-white rounded-xl shadow-md p-6" },
                React.createElement('h3', { className: "text-lg font-bold mb-4" }, "最近の投稿"),
                userPosts.length > 0 ? 
                    React.createElement('div', { className: "space-y-3" },
                        userPosts.slice(0, 5).map(post => 
                            React.createElement('div', { key: post._id || post.id, className: "border-l-4 border-blue-500 pl-4 py-2" },
                                React.createElement('div', { className: "flex items-center justify-between mb-1" },
                                    React.createElement('span', { className: "font-medium" }, post.exercise),
                                    React.createElement('span', { className: "text-xs text-gray-500" }, 
                                        formatTimestamp(post.timestamp)
                                    )
                                ),
                                post.sets && Array.isArray(post.sets) ? 
                                    React.createElement('div', { className: "text-sm text-gray-600" },
                                        `${post.sets.length}セット (最大${Math.max(...post.sets.map(s => s.weight))}kg)`
                                    ) :
                                    React.createElement('div', { className: "text-sm text-gray-600" },
                                        `${post.weight}kg × ${post.reps}回`
                                    )
                            )
                        )
                    ) :
                    React.createElement('p', { className: "text-gray-500 text-center py-4" }, "まだ投稿がありません")
            )
        );
    };

    // ローディング中
    if (isLoading) {
        return React.createElement('div', { className: "min-h-screen bg-blue-600 flex items-center justify-center" },
            React.createElement('div', { className: "text-white text-xl" }, "読み込み中...")
        );
    }

    // 認証フォーム（初回ユーザー向け）
    if (!currentUser && showAuthForm) {
        return React.createElement('div', { className: "min-h-screen bg-blue-600 flex items-center justify-center p-4" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" },
                React.createElement('h2', { className: "text-2xl font-bold mb-4 text-center" }, 
                    isLogin ? 'ログイン' : '新規登録'
                ),
                React.createElement('div', { className: "space-y-3" },
                    React.createElement('input', {
                        type: "email",
                        value: authData.email,
                        onChange: (e) => setAuthData({ ...authData, email: e.target.value }),
                        className: "w-full p-3 border rounded-lg",
                        placeholder: "メールアドレス"
                    }),
                    React.createElement('input', {
                        type: "password",
                        value: authData.password,
                        onChange: (e) => setAuthData({ ...authData, password: e.target.value }),
                        className: "w-full p-3 border rounded-lg",
                        placeholder: "パスワード"
                    }),
                    !isLogin && React.createElement('input', {
                        type: "text",
                        value: authData.username,
                        onChange: (e) => setAuthData({ ...authData, username: e.target.value }),
                        className: "w-full p-3 border rounded-lg",
                        placeholder: "ユーザー名",
                        maxLength: 10
                    }),
                    React.createElement('button', {
                        onClick: isLogin ? handleLogin : handleRegister,
                        className: "w-full bg-blue-600 text-white rounded-lg py-3 font-semibold"
                    }, isLogin ? 'ログイン' : '登録'),
                    React.createElement('div', { className: "text-center" },
                        React.createElement('button', {
                            onClick: () => setIsLogin(!isLogin),
                            className: "text-blue-600 text-sm"
                        }, isLogin ? '新規登録はこちら' : 'ログインはこちら')
                    ),
                    React.createElement('button', {
                        onClick: () => setShowAuthForm(false),
                        className: "w-full text-gray-500 text-sm"
                    }, 'あとでログイン')
                )
            )
        );
    }

    // メインのUI
    return React.createElement('div', { className: "min-h-screen bg-gray-100 pb-20" },
        // ヘッダー
        React.createElement('header', { className: "bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-10" },
            React.createElement('div', { className: "flex items-center justify-between" },
                React.createElement('div', { className: "flex items-center space-x-2" },
                    React.createElement(Dumbbell, { className: "h-6 w-6" }),
                    React.createElement('h1', { className: "text-xl font-bold" }, "FitShare")
                ),
                React.createElement('div', { className: "flex items-center space-x-3" },
                    React.createElement('div', { className: `flex items-center space-x-1 ${connected ? 'text-green-300' : 'text-red-300'}` },
                        connected ? React.createElement(Wifi, { className: "h-4 w-4" }) : React.createElement(WifiOff, { className: "h-4 w-4" }),
                        React.createElement('span', { className: "text-xs" }, connected ? 'オンライン' : 'オフライン')
                    ),
                    currentUser ? 
                        React.createElement('div', { className: "flex items-center space-x-2" },
                            React.createElement('div', { className: "text-sm" }, '👤 ', currentUser.username),
                            React.createElement('button', {
                                onClick: handleLogout,
                                className: "p-1"
                            }, React.createElement(LogOut, { className: "h-5 w-5" }))
                        ) :
                        React.createElement('button', {
                            onClick: () => setShowAuthForm(true),
                            className: "text-sm bg-white text-blue-600 px-3 py-1 rounded"
                        }, 'ログイン')
                )
            )
        ),

        // 画像モーダル
        modalImage && React.createElement(ImageModal, {
            imageUrl: modalImage,
            onClose: () => setModalImage(null)
        }),

        React.createElement('main', { className: "px-4 py-4" },
            // ホーム画面の内容
            currentView === 'home' && React.createElement(React.Fragment, {},
                // 投稿ボタン
                React.createElement('button', {
                    onClick: () => {
                        if (!currentUser) {
                            setShowAuthForm(true);
                        } else {
                            setShowForm(!showForm);
                            setEditingPost(null);
                            if (!showForm) {
                                setFormData({ 
                                    exercises: [{
                                        exercise: '',
                                        sets: [{ weight: '', reps: '' }]
                                    }],
                                    comment: '',
                                    workoutDate: new Date().toISOString().split('T')[0]
                                });
                                setSelectedImage(null);
                            }
                        }
                    },
                    className: "w-full bg-blue-600 text-white rounded-xl p-4 mb-4 flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform",
                    disabled: !connected
                },
                    React.createElement(Plus, { className: "h-5 w-5" }),
                    React.createElement('span', { className: "font-semibold" }, "トレーニングを記録")
                ),

                // 接続エラーメッセージ
                !connected && React.createElement('div', { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4" },
                    React.createElement('p', { className: "text-sm" }, "サーバーに接続できません。接続を確認してください。")
                ),

                // 投稿フォーム（複数種目対応）
                showForm && React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-4 mb-4" },
                    React.createElement('h2', { className: "text-lg font-bold mb-3" }, 
                        editingPost ? 'トレーニング編集' : 'トレーニング記録'
                    ),
                    React.createElement('div', { className: "space-y-3" },
                        // 投稿日指定
                        React.createElement('div', {},
                            React.createElement('label', { className: "block text-sm font-medium mb-1 flex items-center" }, 
                                React.createElement(Calendar, { className: "h-4 w-4 mr-1" }),
                                "トレーニング日"
                            ),
                            React.createElement('input', {
                                type: "date",
                                value: formData.workoutDate,
                                onChange: (e) => setFormData({ ...formData, workoutDate: e.target.value }),
                                max: new Date().toISOString().split('T')[0],
                                className: "w-full p-3 border rounded-lg text-base"
                            })
                        ),

                        // 複数種目入力
                        React.createElement('div', { className: "space-y-4" },
                            formData.exercises.map((exerciseData, exerciseIndex) => 
                                React.createElement('div', { 
                                    key: exerciseIndex, 
                                    className: "border border-gray-200 rounded-lg p-3 bg-gray-50"
                                },
                                    // 種目ヘッダー
                                    React.createElement('div', { className: "flex items-center justify-between mb-3" },
                                        React.createElement('div', { className: "flex items-center space-x-2" },
                                            React.createElement('span', { className: "text-sm font-bold text-gray-600" }, 
                                                `種目 ${exerciseIndex + 1}`
                                            ),
                                            formData.exercises.length > 1 && React.createElement('button', {
                                                onClick: () => removeExercise(exerciseIndex),
                                                className: "text-red-500 hover:text-red-700"
                                            }, React.createElement(Trash, { className: "h-4 w-4" }))
                                        )
                                    ),

                                    // 種目選択
                                    React.createElement('select', {
                                        value: showCustomInput[exerciseIndex] ? 'その他（自由入力）' : exerciseData.exercise,
                                        onChange: (e) => updateExercise(exerciseIndex, e.target.value),
                                        className: "w-full p-2 border rounded-lg text-base mb-3",
                                        required: true
                                    },
                                        React.createElement('option', { value: "" }, "種目を選択"),
                                        exercises.map(ex => React.createElement('option', { key: ex, value: ex }, ex)),
                                        React.createElement('option', { value: "その他（自由入力）" }, "その他（自由入力）")
                                    ),

                                    // カスタム種目入力欄
                                    showCustomInput[exerciseIndex] && React.createElement('input', {
                                        type: "text",
                                        value: exerciseData.exercise,
                                        onChange: (e) => {
                                            const newExercises = [...formData.exercises];
                                            newExercises[exerciseIndex].exercise = e.target.value;
                                            setFormData({ ...formData, exercises: newExercises });
                                        },
                                        className: "w-full p-2 border rounded-lg text-base mb-3",
                                        placeholder: "種目名を入力",
                                        required: true
                                    }),

                                    // セット入力
                                    React.createElement('div', { className: "space-y-2" },
                                        exerciseData.sets.map((set, setIndex) => 
                                            React.createElement('div', { key: setIndex, className: "flex items-center space-x-2" },
                                                React.createElement('span', { className: "text-sm w-12" }, `${setIndex + 1}セット`),
                                                React.createElement('input', {
                                                    type: "number",
                                                    inputMode: "numeric",
                                                    value: set.weight,
                                                    onChange: (e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value),
                                                    onFocus: () => setIndex > 0 && !set.weight && copyPreviousWeight(exerciseIndex, setIndex),
                                                    className: "w-20 p-2 border rounded-lg text-base text-center",
                                                    placeholder: "重量"
                                                }),
                                                React.createElement('span', { className: "text-sm" }, "kg ×"),
                                                React.createElement('input', {
                                                    type: "number",
                                                    inputMode: "numeric",
                                                    value: set.reps,
                                                    onChange: (e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value),
                                                    className: "w-20 p-2 border rounded-lg text-base text-center",
                                                    placeholder: "回数"
                                                }),
                                                React.createElement('span', { className: "text-sm" }, "回"),
                                                exerciseData.sets.length > 1 && React.createElement('button', {
                                                    onClick: () => removeSet(exerciseIndex, setIndex),
                                                    className: "p-1 text-red-500"
                                                }, React.createElement(MinusCircle, { className: "h-5 w-5" }))
                                            )
                                        ),
                                        React.createElement('button', {
                                            onClick: () => addSet(exerciseIndex),
                                            className: "mt-2 flex items-center space-x-1 text-blue-600 text-sm"
                                        },
                                            React.createElement(PlusCircle, { className: "h-4 w-4" }),
                                            React.createElement('span', {}, "セットを追加")
                                        )
                                    )
                                )
                            ),

                            // 種目追加ボタン（編集時は非表示）
                            !editingPost && React.createElement('button', {
                                onClick: addExercise,
                                className: "w-full mt-2 p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center space-x-2"
                            },
                                React.createElement(Plus, { className: "h-5 w-5" }),
                                React.createElement('span', {}, "種目を追加")
                            )
                        ),

                        // 画像アップロード（新規投稿時のみ）
                        !editingPost && React.createElement('div', {},
                            React.createElement('label', { className: "block text-sm font-medium mb-1 flex items-center" },
                                React.createElement(Camera, { className: "h-4 w-4 mr-1" }),
                                "写真（任意）"
                            ),
                            React.createElement('input', {
                                type: "file",
                                accept: "image/*",
                                onChange: handleImageSelect,
                                className: "w-full p-2 border rounded-lg text-sm"
                            }),
                            selectedImage && React.createElement('p', { className: "text-sm text-gray-600 mt-1" }, 
                                `選択: ${selectedImage.name}`
                            )
                        ),

                        // コメント（改行対応）
                        React.createElement('div', {},
                            React.createElement('label', { className: "block text-sm font-medium mb-1" }, "コメント"),
                            React.createElement('textarea', {
                                value: formData.comment,
                                onChange: (e) => setFormData({ ...formData, comment: e.target.value }),
                                className: "w-full p-3 border rounded-lg text-base",
                                rows: "3",
                                placeholder: "今日の調子、感想など...\n改行も使えます"
                            })
                        ),

                        // ボタン
                        React.createElement('div', { className: "flex space-x-2" },
                            React.createElement('button', {
                                onClick: editingPost ? handleUpdate : handleSubmit,
                                className: "flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold active:bg-blue-700"
                            }, editingPost ? '更新' : '投稿'),
                            React.createElement('button', {
                                onClick: () => {
                                    setShowForm(false);
                                    setEditingPost(null);
                                    setFormData({ 
                                        exercises: [{
                                            exercise: '',
                                            sets: [{ weight: '', reps: '' }]
                                        }],
                                        comment: '',
                                        workoutDate: new Date().toISOString().split('T')[0]
                                    });
                                    setSelectedImage(null);
                                },
                                className: "flex-1 bg-gray-300 text-gray-700 rounded-lg py-3 font-semibold active:bg-gray-400"
                            }, "キャンセル")
                        )
                    )
                ),

                // 投稿一覧
                React.createElement('div', { className: "space-y-3" },
                    posts.map(post => {
                        const postUser = post.userId || post.user;
                        const isOwner = currentUser && postUser && (
                            (typeof postUser === 'object' && postUser._id === currentUser.id) ||
                            (typeof postUser === 'string' && postUser === currentUser.username)
                        );
                        const hasLiked = currentUser && post.likedBy && post.likedBy.includes(currentUser.id);
                        const displayUser = typeof postUser === 'object' ? postUser.username : post.user;
                        const displayAvatar = typeof postUser === 'object' ? postUser.avatar : post.avatar;
                        
                        return React.createElement('div', { key: post._id || post.id, className: "bg-white rounded-xl shadow-md p-4" },
                            React.createElement('div', { className: "flex items-start space-x-3" },
                                React.createElement('div', { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold" },
                                    displayAvatar
                                ),
                                React.createElement('div', { className: "flex-1" },
                                    React.createElement('div', { className: "flex items-center justify-between mb-2" },
                                        React.createElement('h3', { className: "font-semibold" }, displayUser),
                                        React.createElement('div', { className: "flex items-center space-x-2" },
                                            React.createElement('span', { className: "text-xs text-gray-500" }, 
                                                formatTimestamp(post.workoutDate || post.timestamp)
                                            ),
                                            isOwner && React.createElement('div', { className: "flex items-center space-x-1" },
                                                React.createElement('button', {
                                                    onClick: () => handleEdit(post),
                                                    className: "p-1 text-gray-500 hover:text-blue-500"
                                                }, React.createElement(Edit, { className: "h-4 w-4" })),
                                                React.createElement('button', {
                                                    onClick: () => handleDelete(post._id || post.id),
                                                    className: "p-1 text-gray-500 hover:text-red-500"
                                                }, React.createElement(Trash, { className: "h-4 w-4" }))
                                            )
                                        )
                                    ),
                                    
                                    React.createElement('div', { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-2" },
                                        React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                            React.createElement(Dumbbell, { className: "h-4 w-4 text-blue-600" }),
                                            React.createElement('span', { className: "font-semibold" }, post.exercise)
                                        ),
                                        // セットごとの詳細表示
                                        post.sets && Array.isArray(post.sets) ? 
                                            React.createElement('div', { className: "space-y-1" },
                                                post.sets.map((set, index) => 
                                                    React.createElement('div', { key: index, className: "flex items-center space-x-2 text-sm" },
                                                        React.createElement('span', { className: "font-medium text-gray-600 w-16" }, `${index + 1}セット:`),
                                                        React.createElement('span', { className: "font-bold text-blue-600" }, `${set.weight}kg × ${set.reps}回`)
                                                    )
                                                )
                                            ) :
                                            // 古い形式の投稿の場合の表示
                                            React.createElement('div', { className: "text-sm font-bold text-blue-600" },
                                                `${post.weight}kg × ${post.reps}回`
                                            )
                                    ),

                                    // 画像表示（クリックで拡大）
                                    post.image && React.createElement('div', { 
                                        className: "mb-2 cursor-pointer relative group",
                                        onClick: () => setModalImage(`${SERVER_URL}${post.image}`)
                                    },
                                        React.createElement('img', {
                                            src: `${SERVER_URL}${post.image}`,
                                            alt: "トレーニング写真",
                                            className: "rounded-lg max-h-64 w-full object-cover"
                                        }),
                                        React.createElement('div', {
                                            className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center"
                                        },
                                            React.createElement('div', {
                                                className: "bg-white bg-opacity-90 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            },
                                                React.createElement(Image, { className: "h-5 w-5 text-gray-700" })
                                            )
                                        )
                                    ),

                                    // コメント（改行対応）
                                    post.comment && React.createElement(CommentWithLineBreaks, { comment: post.comment }),

                                    React.createElement('div', { className: "flex items-center space-x-4" },
                                        React.createElement('button', {
                                            onClick: () => handleLike(post._id || post.id),
                                            className: "flex items-center space-x-1 text-gray-600 active:text-red-500",
                                            disabled: !connected
                                        },
                                            React.createElement(Heart, { className: `h-5 w-5 ${hasLiked ? 'fill-red-500 text-red-500' : ''}` }),
                                            React.createElement('span', { className: "text-sm" }, post.likes || 0)
                                        ),
                                        React.createElement('div', { className: "flex items-center space-x-1 text-gray-600" },
                                            React.createElement(MessageCircle, { className: "h-5 w-5" }),
                                            React.createElement('span', { className: "text-sm" }, post.comments || 0)
                                        )
                                    )
                                )
                            )
                        );
                    })
                )
            ),

            // プロフィール画面
            currentView === 'profile' && React.createElement(ProfilePage)
        ),

        // ボトムナビゲーション
        React.createElement('nav', { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2" },
            React.createElement('div', { className: "flex justify-around" },
                React.createElement('button', {
                    onClick: () => setCurrentView('home'),
                    className: `flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
                        currentView === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                    }`
                },
                    React.createElement(Home, { className: "h-6 w-6" }),
                    React.createElement('span', { className: "text-xs font-medium" }, "ホーム")
                ),
                React.createElement('button', {
                    onClick: () => setCurrentView('profile'),
                    className: `flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
                        currentView === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                    }`
                },
                    React.createElement(User, { className: "h-6 w-6" }),
                    React.createElement('span', { className: "text-xs font-medium" }, "プロフィール")
                )
            )
        )
    );
};

// アプリケーションをマウント
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(FitShareApp));