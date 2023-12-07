import React,{useState,useEffect} from 'react';
import {Routes, Route, useNavigate} from 'react-router-dom';
import api from '../untils/Api';
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import ImagePopup from "./ImagePopup";
import {CurrentUserContext} from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import Login from './Login';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import * as auth from '../untils/auth';

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
    const [selectedCard,setSelectedCard] = useState ({});
    const [currentUser, setCurrentUser] =useState({})
    const [cards, setCards]= useState([]);
    const loggedInFromStorage = JSON.parse(localStorage.getItem('isLoggedIn'));
    const [isLoggedIn, setIsLoggedIn] = useState(loggedInFromStorage);
    const [authEmail, setAuthEmail] = useState('');
    const navigate = useNavigate();
    const [isMessage, setIsMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        api.updateToken(token);
        if (isLoggedIn){
        Promise.all([api.getUserInfo(), api.getInitialCards()])
            .then(([userData, initialCards]) => {
                setCurrentUser(userData);
                console.log(initialCards);
                setCards(initialCards);
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
        }
    }, [isLoggedIn]);

    function handleCardLike(card) {
        //const isLiked = card.likes.some((i) => i._id === currentUser._id);
        const isLiked = card.likes.includes(currentUser._id);
        console.log(isLiked);
        if (isLiked) {
            api.deleteLike(card._id)
                .then((newCard) => {
                    console.log(newCard, 'delete');
                    setCards((state) =>
                        state.map((c) => (c._id === card._id ? newCard : c))
                    );
                })
                .catch((err) => {
                    console.log(`Ошибка: ${err}`);
                });
        } else {
            api.addLike(card._id)
                .then((newCard) => {
                    console.log(newCard, 'PUT');

                    setCards((state) =>
                        state.map((c) => (c._id === card._id ? newCard : c))
                    );
                })
                .catch((err) => {
                    console.log(`Ошибка: ${err}`);
                });
        }
    }

    function handleCardDelete(id) {
        api.deleteCard(id)
            .then(() => {
                setCards((cards) => cards.filter((card) => card._id !== id));
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    function handelUpdateUser ({name, about}){
        api.setUserInfo({name,about})
            .then((newUserData)=>{
                setCurrentUser(newUserData);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    function handleUpdateAvatar (newAvatarData){
        api.setUserAvatar(newAvatarData)
            .then((data)=>{
                setCurrentUser(data);
                closeAllPopups();
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    function handleAddPlaceSubmit (data) {
        api.setNewCard(data)
            .then((newCard) =>{
                setCards([newCard, ...cards]);
                closeAllPopups()
            })
            .catch((err) => {
                console.log(`Ошибка: ${err}`);
            });
    }

    // Метод для открытия попапа редактирования аватара
    const handleEditAvatarClick = () => {
        setIsEditAvatarPopupOpen(true)
    };

    // Метод для открытия попапа редактирования профиля
    const handleEditProfileClick = () => {
        setIsEditProfilePopupOpen(true)
    };

    // Метод для открытия попапа добавления места
    const handleAddPlaceClick = () => {
        setIsAddPlacePopupOpen(true)
    };

    const handleInfoTooltip = () => {
        setIsInfoTooltipOpen(true);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card)
    }

    const closeAllPopups = () => {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsInfoTooltipOpen(false);
        setSelectedCard({})
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            auth.getContent(token)
                .then((data) => {
                    localStorage.setItem('isLoggedIn', JSON.stringify(true));
                    setIsLoggedIn(true);
                    console.log(data)
                    setAuthEmail(data.email);
                    navigate('/');
                })
                .catch((err) => {
                    localStorage.setItem('isLoggedIn', JSON.stringify(false));
                    console.error(`Ошибка при проверке токена: ${err}`);
                    localStorage.removeItem('token');
                });
        }
    }, [navigate]);

    const handleRegister = ({ email, password }) => {
        auth.register({ email, password })
            .then((res) => {
                setIsMessage('Вы успешно зарегистрировались!');
                console.log('Регистрация прошла успешно', res);
                handleInfoTooltip();
                navigate('/sign-in');
            })
            .catch((err) => {
                setIsMessage('Что-то пошло не так! Попробуйте ещё раз.');
                console.error(`Ошибка при регистрации: ${err}`);
                setIsLoggedIn(false);
                handleInfoTooltip();
            });
    };

    const handleLogin = ({ email, password }) => {
        auth.authorize({ email, password })
            .then((data) => {
                //console.log(data.token)
                console.log(data)
                if (data.token) {
                    localStorage.setItem('isLoggedIn', JSON.stringify(true));
                    setIsLoggedIn(true);
                    console.log(data.token)
                    localStorage.setItem('token', data.token);
                    navigate('/');
                }
            })
            .catch((err) =>{
                setIsMessage('Что-то пошло не так! Попробуйте ещё раз.');
                console.error(`Ошибка при входе: ${err}`);
                handleInfoTooltip();
            });
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        navigate('/sign-in');
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn]);

  return (
       <CurrentUserContext.Provider value={currentUser}>
          <div className="page">
            <Header loggedIn={isLoggedIn} userEmail={authEmail} onSignOut={handleSignOut}/>
            <Routes>
                <Route path="/sign-in" element={<Login onLogin={handleLogin}/>}/>
                <Route path="/sign-up" element={<Register onRegister={handleRegister}/>}/>
                <Route path="/" element={
                    <ProtectedRoute element={ Main}
                        loggedIn={isLoggedIn}
                        onEditProfile={handleEditProfileClick}
                        onAddPlace={handleAddPlaceClick}
                        onEditAvatar={handleEditAvatarClick}
                        onCardClick={handleCardClick}
                        cards={cards}
                        selectedCard={selectedCard}
                        onClose={closeAllPopups}
                        onCardLike={handleCardLike}
                        onCardDelete={handleCardDelete}
                    />
                  }
                />
           </Routes>
            <Footer />
            <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handelUpdateUser}/>
            <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar}/>
            <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit}/>
            <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
            <InfoTooltip onClose={closeAllPopups} isOpen={isInfoTooltipOpen} message={isMessage}/>
          </div>
      </CurrentUserContext.Provider>
  );
}

export default App;
