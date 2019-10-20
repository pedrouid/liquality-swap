import React, { Component } from 'react'
import Button from '../../components/Button/Button'
import BrandCard from '../../components/BrandCard/BrandCard'
import agent from '../../services/agentClient'
import cryptoassets from '@liquality/cryptoassets'

import './CounterPartySelection.css'

class CounterPartySelection extends Component {
  constructor () {
    super()
    this.state = { marketInfo: [] }
  }

  componentDidMount () {
    agent.getMarketInfo().then((marketInfo) => {
      const convertedUnits = marketInfo.map(m => {
        const convertedMin = cryptoassets[m.from.toLowerCase()].unitToCurrency(m.min)
        const convertedMax = cryptoassets[m.from.toLowerCase()].unitToCurrency(m.max)
        return {
          ...m,
          min: convertedMin,
          max: convertedMax
        }
      })
      this.setState({ marketInfo: convertedUnits })
    })
  }

  handleAmountChange (from, to, amount) {
    this.setState({[from + to]: amount})
  }

  handleAcceptOffer (from, to, min) {
    const amount = cryptoassets[from.toLowerCase()].currencyToUnit(this.state[from + to])
    this.props.retrieveAgentQuote(from, to, amount)
    this.props.history.replace('/offerConfirmation')
  }

  render () {
    return <BrandCard className='CounterPartySelection' title='Trade with us or bring your own counterparty'>
      <div class='CounterPartySelection_offers'>
        <h2>Offers</h2>
        <div class='CounterPartySelection_table_wrapper'>
          <table class='CounterPartySelection_table'>
            <thead>
              <tr>
                <th />
                <th>Have</th>
                <th>Want</th>
                <th>Estimated Rate</th>
                <th>Min</th>
                <th>Max</th>
                <th />
              </tr>
            </thead>
            <tbody>
              { this.state.marketInfo.map(market => <tr>
                <td><input type='text' className='amountInput' onChange={(e) => this.handleAmountChange(market.from, market.to, e.target.value)} /></td>
                <th>{market.from}</th>
                <td>{market.to}</td>
                <td>{market.rate}</td>
                <td>{market.min} {market.from}</td>
                <td>{market.max} {market.from}</td>
                <td className='button'><Button secondary small wide onClick={() => { this.handleAcceptOffer(market.from, market.to, market.min) }}>Get Rate</Button></td>
              </tr>) }
            </tbody>
          </table>
        </div>
      </div>
      <div class='CounterPartySelection_buttons'>
        <p><Button wide secondary onClick={() => this.props.history.replace('/assetSelection')}>I have a counterparty</Button></p>
      </div>
    </BrandCard>
  }
}

export default CounterPartySelection