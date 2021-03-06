package carrot

import (
	"fmt"
	"time"

	"github.com/streadway/amqp"
)

//Subscriber is a consumer component to Rabbit
type Subscriber struct {
	client       *BrokerClient
	maxRetries   int
	currentRetry int
}

const picker = "picker"
const subscriber = "subscriber"
const publisher = "publisher"

//MessageContext manager received message from rabbit and ack process
type MessageContext struct {
	Message       Message
	delivery      amqp.Delivery
	channel       *amqp.Channel
	componentType string
	subscriber    *Subscriber
}

//Ack message to server
func (ctx *MessageContext) Ack() error {
	err := ctx.delivery.Ack(false)
	if err != nil {
		return err
	}
	if ctx.isPicker() {
		return ctx.channel.Close()
	}
	return nil
}

func (ctx *MessageContext) isPicker() bool {
	return ctx.componentType == picker
}

func (ctx *MessageContext) isPublisher() bool {
	return ctx.componentType == publisher
}

func (ctx *MessageContext) isSubscriber() bool {
	return ctx.componentType == subscriber
}

//Nack message to server if requeue = true the message will be sent to same queue
func (ctx *MessageContext) Nack(requeue bool) error {
	return ctx.delivery.Nack(false, requeue)
}

//RedirectTo redirect message to other exchange
func (ctx *MessageContext) RedirectTo(exchange, routingKey string) error {
	ch, err := ctx.subscriber.client.Channel()
	if err == nil {
		err = ch.Publish(exchange, routingKey, false, false, amqp.Publishing{
			Body:            ctx.Message.Data,
			ContentEncoding: ctx.Message.Encoding,
			ContentType:     ctx.Message.ContentType,
			Headers:         ctx.Message.Headers,
			DeliveryMode:    amqp.Persistent,
			Priority:        0,
		})
	}
	return err
}

//SubscribeWorker is the worker handler for queues
type SubscribeWorker struct {
	Scale   uint
	Handler func(*MessageContext) error
	AutoAck bool
	Queue   string
}

//Subscribe binds a worker to queue on Rabbit
func (sub *Subscriber) Subscribe(worker SubscribeWorker) error {
	var i uint = 0
	for i = 0; i < worker.Scale; i++ {
		ch, err := sub.client.client.Channel()
		if err == nil {
			msgs, err := ch.Consume(
				worker.Queue,   // queue
				"",             // consumer
				worker.AutoAck, // auto-ack
				false,          // exclusive
				false,          // no-local
				false,          // no-wait
				nil,            // args
			)
			if err == nil {
				go messageHandler(worker, msgs, ch, sub)
			}
		}
	}
	return nil
}

//SetMaxRetries on reconnecting subscriber
func (sub *Subscriber) SetMaxRetries(n int) {
	sub.maxRetries = n
}

func messageHandler(worker SubscribeWorker, msgsChan <-chan amqp.Delivery, channel *amqp.Channel, sub *Subscriber) {
	notifyCloseChannel := channel.NotifyClose(make(chan *amqp.Error))
	notifyClientConnectionClose := sub.client.client.NotifyClose(make(chan *amqp.Error))

	recoverConnection := func() bool {
		fmt.Println("reconnecting to rabbitmq")
		err := sub.client.Reconnect()
		for err != nil && sub.currentRetry <= sub.maxRetries {
			time.Sleep(5000 * time.Millisecond)
			err = sub.client.Reconnect()
			sub.currentRetry++

		}
		if sub.currentRetry > sub.maxRetries {
			fmt.Println(fmt.Sprintf("limit of retries %d was exceed", sub.maxRetries))
			return false
		} else if err == nil {
			ch, err := sub.client.client.Channel()
			if err == nil {
				fmt.Println("Try to connect")
				msgs, err := ch.Consume(
					worker.Queue,   // queue
					"",             // consumer
					worker.AutoAck, // auto-ack
					false,          // exclusive
					false,          // no-local
					false,          // no-wait
					nil,            // args
				)
				if err == nil {
					go messageHandler(worker, msgs, ch, sub)
					return false
				} else {
					fmt.Println(err)
				}
			}
		}
		return true
	}
INFI:
	for {
		select { //check connection
		case <-notifyClientConnectionClose:
			if !recoverConnection() {
				break INFI
			} else {
				break
			}
		case <-notifyCloseChannel:
			if !recoverConnection() {
				break INFI
			} else {
				break
			}
		case message := <-msgsChan:
			context := new(MessageContext)
			context.channel = channel
			context.Message = Message{
				ContentType: message.ContentType,
				Data:        message.Body,
				Encoding:    message.ContentEncoding,
			}
			context.delivery = message
			context.subscriber = sub
			worker.Handler(context)
		}
	}

}

//NewSubscriber creates a new Subscriber for Rabbit
func NewSubscriber(client *BrokerClient) *Subscriber {
	subs := new(Subscriber)
	subs.client = client
	return subs
}
