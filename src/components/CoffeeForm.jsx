import {coffeeOptions} from "../utils"
import {useState} from "react"
import Authentication from "./Authentication"
import Modal from "./Modal"
import { useAuth } from "../Context/AuthContext"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase"


export default function CoffeForm(props) {
    const {isAuthenticated} = props // destructure the isAuthenticated prop from props
    const [showModal, setShowModal] = useState(false) // state to control the modal
    const [selectedCoffee, setSelectedCoffee] = useState(null) // state to control border around selected button 
    const [showCoffeeTypes, setShowCoffeeTypes] = useState(false) // state to control the 'other button' r23
    const [coffeeCost, setCoffeeCost] = useState(0) // state to control the cost of the coffee
    const [hour, setHour] = useState(0) // state to control the hour of consumption
    const [minute, setMinute] = useState(0) // state to control the minute of consumption

    const {globalData, setGlobalData, globalUser} = useAuth() // destructure the globalData prop from props

    async function handleSubmitForm() {
        if (!isAuthenticated) {
            setShowModal(true) 
            return 
        }

        // define a guard clause that only submits the form if it is completed
        if (!selectedCoffee) {
            return 
        }

        try { // then we are going to create a new data object 
            const newGlobalData = {
                ...(globalData || {})
            }
    
            const nowTime = Date.now() 
            const timetoSubtract = (hour * 60 * 60 * 1000) + (minute * 60 * 1000) // convert to milliseconds
            const timeStamp = nowTime - timetoSubtract // subtract the time from now
            const newData = {
                name: selectedCoffee,
                cost: coffeeCost
            }
            
            newGlobalData[timeStamp] = newData
    
            console.log(timeStamp, selectedCoffee, coffeeCost)
             
            //update the global state
            setGlobalData(newGlobalData) // update the global state with the new data
    
            //persist the data in the firebase firestore
            const userRef = doc(db, "users", globalUser.uid ) // get the user reference from the firestore
            const res = await setDoc(userRef, {
                [timeStamp]: newData // add the new data to the user document 
            }, {merge: true})
             // adds to the existing entry rather than overwriting it

            setSelectedCoffee(null) // reset the selected coffee state
            setHour(0) // reset the hour state
            setMinute(0) // reset the minute state  
            setCoffeeCost(0) // reset the coffee cost state  
        } catch (err) {
            console.log(err.message)
        }   
    }    

    function handleCloseModal() {
        setShowModal(false)
    }

    return (
        <>
        {showModal &&(
            <Modal handleCloseModal={handleCloseModal}>
                <Authentication handleCloseModal={handleCloseModal} />
            </Modal>
        )}
            <div className="section-header">
                <i className="fa-solid fa-pencil" />
                <h2>Start Tracking Today</h2>
            </div>
                <h4>Select Cofee Type</h4>
            <div className="coffee-grid"> 
                {coffeeOptions.slice(0,5).map((option, optionIndex) => {
                    return (
                    <button onClick={()=>{
                        setSelectedCoffee(option.name)
                        setShowCoffeeTypes(false)
                    }} className={"button-card " + (option.name === 
                    selectedCoffee ? "coffee-button-selected" : " ")} key={optionIndex}>
                        <h4>{option.name}</h4>
                        <p>{option.caffeine} mg</p>
                    </button>
                    )
                })}
                    <button onClick={() => {
                        setShowCoffeeTypes(true)
                        setSelectedCoffee(null)
                    }} className={"button-card " + (showCoffeeTypes ? "coffee-button-selected" : " ")}>
                        <h4>Other</h4>
                        <p>n/a</p>
                    </button>
            </div>
            
            {showCoffeeTypes && (
                <select 
                onChange={(e) =>{setSelectedCoffee(e.target.value)
                }} 
                id="coffee-list" 
                name="coffee-list">
                <option value={null}>Select Type</option>
                {coffeeOptions.map((option, optionIndex) => {
                    return (
                        <option value={option.name} key={optionIndex}>
                        {option.name} {option.caffeine} mg
                        </option>
                    )
                })}</select>)}

            <h4>Add the Cost (£)</h4>
            <input className="w-full" type="number" value={coffeeCost} onChange={(e) => {
                setCoffeeCost(e.target.value)
            }} placeholder="4.50"/>
            <h4>Time since consumtion</h4>
            <div className="time-entry">
                <div>
                    <h6>Hours</h6>
                    <select 
                        onChange={(e) => {setHour(e.target.value)}} 
                        id="hours-select">
                        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
                        .map((hour, hourIndex) => {
                            return(
                                <option key={hourIndex} value={hour}>{hour}
                                </option>
                            )
                        })}                   
                    </select>
                </div>
                <div>
                    <h6>Minutes</h6>
                    <select 
                    onChange={(e) => {setMinute(e.target.value)}}  
                    id="mins-select">
                        {[0,5, 10,15,20,25,30,35,40,45,50,55]
                        .map((min, minIndex) => {
                            return(
                                <option key={minIndex} value={min}>{min}
                                </option>
                            )
                        })}                   
                    </select>
                </div>
            </div>
            <button onClick={handleSubmitForm} className="button-card" id="add-entry-button">
                <p>Add Entry</p>
            </button>    
        </>
    )
}