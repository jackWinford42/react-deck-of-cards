import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v1 as uuidv1 } from 'uuid';

/** This function single handedly establishes a deck of cards, draws from that
 * deck, and draws from the deck at set intervals. The function also renders
 * a button for toggling drawing cards as well as rendering the cards themselves.
 */
function Deck() {
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [deckEmpty, setDeckEmpty] = useState(false);
    const [cardsDrawn, setCardsDrawn] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const timerId = useRef();

    useEffect(() => {
        async function getDeck() {
            const res = await axios.get(`http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
            setDeck(res.data);
        }
        getDeck();
    }, [deckEmpty]);

    const DrawCard = () => {
        setDrawing(true)
        timerId.current = setInterval(() => {
            async function getCard() {
                const res = await axios.get(`http://deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=1`);
                if (res.data.remaining === 0) {
                    setDeckEmpty(!deckEmpty);
                    setDrawing(false);
                    setCards([])
                    clearInterval(timerId.current);
                    setCardsDrawn(0);
                    return alert("Error: no cards remaining!");
                }
                setCards(cards => [...cards, res.data.cards[0]]);
            }
            //Without this if statement the final cardsDrawn shows 53 
            if(cardsDrawn < 52) setCardsDrawn(cardsDrawn => cardsDrawn + 1);
            getCard();
        }, 1000)

        return () => {
            clearInterval(timerId.current)
        }
    };

    const stopDraw = () => {
        setDrawing(false)
        clearInterval(timerId.current)
    }

    let displayCards = [];
    displayCards = cards.map(cardData => 
        <img src={cardData.image} key={uuidv1()} alt={cardData.code}></img>
    )
    return (
        <div>
            <button onClick={(!drawing) ? DrawCard : stopDraw}>{(!drawing) ? "start drawing" : "stop drawing"}</button>
            <span>{cardsDrawn}</span>
            <div>
                {displayCards}
            </div>
        </div>
    )
}

export default Deck;